import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Alert,
    FinalForm,
    FinalFormSaveSplitButton,
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
import { ContentScopeInterface, EditPageLayout, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { Card, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import {
    brevoContactFormCheckForChangesQuery,
    brevoContactFormQuery,
    createBrevoTestContactMutation,
    updateBrevoContactMutation,
} from "./BrevoTestContactForm.gql";
import {
    GQLBrevoContactFormCheckForChangesQuery,
    GQLBrevoContactFormCheckForChangesQueryVariables,
    GQLBrevoContactFormQuery,
    GQLBrevoContactFormQueryVariables,
    GQLCreateBrevoTestContactMutation,
    GQLCreateBrevoTestContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoTestContactForm.gql.generated";

export type EditBrevoContactFormValues = {
    [key: string]: unknown;
};

type BaseBrevoContactFormValues = EditBrevoContactFormValues & {
    email: string;
};

interface FormProps {
    id?: number;
    scope: ContentScopeInterface;
    additionalFormFields?: React.ReactNode;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

export function BrevoTestContactForm({ id, scope, input2State, additionalFormFields, additionalAttributesFragment }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<BaseBrevoContactFormValues>();

    const brevoTestContactFormFragment = gql`
        fragment BrevoTestContactForm on BrevoContact {
            email
            createdAt
            emailBlacklisted
            smsBlacklisted
            ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment?.name) : ""}
        }
        ${additionalAttributesFragment?.fragment ?? ""}
`;
    const { data, error, loading, refetch } = useQuery<GQLBrevoContactFormQuery, GQLBrevoContactFormQueryVariables>(
        brevoContactFormQuery(brevoTestContactFormFragment),
        id ? { variables: { id, scope } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<EditBrevoContactFormValues>>(() => {
        let additionalInitialValues = {};

        if (input2State) {
            additionalInitialValues = input2State({
                email: "",
                ...data?.brevoContact,
            });
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

    const handleSubmit = async (state: BaseBrevoContactFormValues, form: FormApi<BaseBrevoContactFormValues>, event: FinalFormSubmitEvent) => {
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
            const { email, ...rest } = output;
            await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                mutation: updateBrevoContactMutation(brevoTestContactFormFragment),
                variables: { id, input: rest, scope },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoTestContactMutation, GQLCreateBrevoTestContactMutationVariables>({
                mutation: createBrevoTestContactMutation,
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const response = mutationResponse?.createBrevoTestContact;

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
        <FinalForm<BaseBrevoContactFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <EditPageLayout>
                    {saveConflict.dialogs}
                    <Toolbar>
                        <ToolbarItem>
                            <IconButton onClick={stackApi?.goBack}>
                                <ArrowLeft />
                            </IconButton>
                        </ToolbarItem>
                        <ToolbarTitleItem>
                            <FormattedMessage id="cometBrevoModule.brevoTestContacts.brevoTestContact" defaultMessage="Test contact" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveSplitButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        {mode === "edit" && (
                            <Box sx={{ marginBottom: 4 }}>
                                <Alert severity="warning">
                                    <FormattedMessage
                                        id="cometBrevoModule.brevoContact.contactEditAlert"
                                        defaultMessage="Editing a contact will affect all scopes and the target groups within those scopes."
                                    />
                                </Alert>
                            </Box>
                        )}
                        <TextField
                            required
                            fullWidth
                            name="email"
                            label={<FormattedMessage id="cometBrevoModule.brevoTestContact.email" defaultMessage="Email" />}
                            disabled={mode === "edit"}
                        />

                        {additionalFormFields && (
                            <Card sx={{ padding: 4 }}>
                                <FormSection
                                    title={<FormattedMessage id="cometBrevoModule.brevoTestContact.attributes" defaultMessage="Attributes" />}
                                >
                                    {additionalFormFields}
                                </FormSection>
                            </Card>
                        )}
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
