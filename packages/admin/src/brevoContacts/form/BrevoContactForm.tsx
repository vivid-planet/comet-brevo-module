import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Alert,
    FinalForm,
    FinalFormSaveButton,
    FinalFormSubmitEvent,
    FormSection,
    Loading,
    MainContent,
    TextField,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useFormApiRef,
    useStackApi,
} from "@comet/admin";
import { ArrowLeft } from "@comet/admin-icons";
import { ContentScopeInterface, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { Card, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import {
    brevoContactFormCheckForChangesQuery,
    brevoContactFormQuery,
    createBrevoContactMutation,
    updateBrevoContactMutation,
} from "./BrevoContactForm.gql";
import {
    GQLBrevoContactFormCheckForChangesQuery,
    GQLBrevoContactFormCheckForChangesQueryVariables,
    GQLBrevoContactFormQuery,
    GQLBrevoContactFormQueryVariables,
    GQLCreateBrevoContactMutation,
    GQLCreateBrevoContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoContactForm.gql.generated";

export type EditBrevoContactFormValues = {
    email: string;
    redirectionUrl: string;
    [key: string]: unknown;
};

interface FormProps {
    id?: number;
    scope: ContentScopeInterface;
    additionalFormFields?: React.ReactNode;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

export function BrevoContactForm({ id, scope, input2State, additionalFormFields, additionalAttributesFragment }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<EditBrevoContactFormValues>();

    const brevoContactFormFragment = gql`
        fragment BrevoContactForm on BrevoContact {
            email
            createdAt
            emailBlacklisted
            smsBlacklisted
            ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment?.name) : ""}
        }
        ${additionalAttributesFragment?.fragment ?? ""}
`;
    const { data, error, loading, refetch } = useQuery<GQLBrevoContactFormQuery, GQLBrevoContactFormQueryVariables>(
        brevoContactFormQuery(brevoContactFormFragment),
        id ? { variables: { id, scope } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<EditBrevoContactFormValues>>(() => {
        let additionalInitialValues = {};

        if (input2State) {
            additionalInitialValues = input2State({ email: "", redirectionUrl: "", ...data?.brevoContact });
        }
        return data?.brevoContact
            ? {
                  email: data.brevoContact.email,
                  ...additionalInitialValues,
              }
            : additionalInitialValues;
    }, [data?.brevoContact, input2State]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            if (!id) {
                return false;
            }
            const { data: updatedData } = await client.query<
                GQLBrevoContactFormCheckForChangesQuery,
                GQLBrevoContactFormCheckForChangesQueryVariables
            >({
                query: brevoContactFormCheckForChangesQuery,
                variables: { id, scope },
                fetchPolicy: "no-cache",
            });

            return resolveHasSaveConflict(data?.brevoContact?.modifiedAt, updatedData.brevoContact.modifiedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (state: EditBrevoContactFormValues, form: FormApi<EditBrevoContactFormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const output = {
            ...state,
            blocked: false,
        };

        if (mode === "edit") {
            if (!id) {
                throw new Error("Missing id in edit mode");
            }
            const { email, redirectionUrl, ...rest } = output;
            await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                mutation: updateBrevoContactMutation(brevoContactFormFragment),
                variables: { id, input: rest, scope },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoContactMutation, GQLCreateBrevoContactMutationVariables>({
                mutation: createBrevoContactMutation,
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const response = mutationResponse?.createBrevoContact;

                if (response === "SUCCESSFUL") {
                    setTimeout(() => {
                        stackApi?.goBack();
                    });
                } else if (response === "ERROR_CONTAINED_IN_ECG_RTR_LIST") {
                    throw new Error("Contact contained in ECG RTR list, cannot create contact");
                } else {
                    throw new Error("Error creating contact");
                }
            }
        }
    };

    if (error) throw error;

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<EditBrevoContactFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <>
                    {saveConflict.dialogs}
                    <Toolbar>
                        <ToolbarItem>
                            <IconButton onClick={stackApi?.goBack}>
                                <ArrowLeft />
                            </IconButton>
                        </ToolbarItem>
                        <ToolbarTitleItem>
                            <FormattedMessage id="cometBrevoModule.brevoContacts.brevoContact" defaultMessage="Contact" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <Box sx={{ marginBottom: 4 }}>
                            <Alert severity="warning">
                                {mode === "edit" ? (
                                    <FormattedMessage
                                        id="cometBrevoModule.brevoContact.contactEditAlert"
                                        defaultMessage="Editing a contact will affect all scopes and the target groups within those scopes."
                                    />
                                ) : (
                                    <FormattedMessage
                                        id="cometBrevoModule.brevoContact.contactAddAlert"
                                        defaultMessage="The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page."
                                    />
                                )}
                            </Alert>
                        </Box>
                        <TextField
                            required
                            fullWidth
                            name="email"
                            label={<FormattedMessage id="cometBrevoModule.brevoContact.email" defaultMessage="Email" />}
                            disabled={mode === "edit"}
                        />
                        {mode === "add" && (
                            <TextField
                                required
                                fullWidth
                                name="redirectionUrl"
                                label={
                                    <FormattedMessage
                                        id="cometBrevoModule.brevoContact.redirectionUrl"
                                        defaultMessage="Redirection Url (Contact will be redirected to this page after the confirmation in the double opt-in email)"
                                    />
                                }
                            />
                        )}
                        {additionalFormFields && (
                            <Card sx={{ padding: 4 }}>
                                <FormSection title={<FormattedMessage id="cometBrevoModule.brevoContact.attributes" defaultMessage="Attributes" />}>
                                    {additionalFormFields}
                                </FormSection>
                            </Card>
                        )}
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
}
