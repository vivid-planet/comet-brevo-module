import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
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
    useStackSwitchApi,
} from "@comet/admin";
import { ArrowLeft } from "@comet/admin-icons";
import { ContentScopeInterface, EditPageLayout, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { Card, IconButton } from "@mui/material";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables } from "../BrevoContactsGrid.generated";
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
} from "./BrevoContactForm.gql.generated";

export type EditBrevoContactFormValues = {
    email: string;
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
    const stackSwitchApi = useStackSwitchApi();

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
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<EditBrevoContactFormValues>>(() => {
        let additionalInitialValues = {};

        if (input2State) {
            additionalInitialValues = input2State(data?.brevoContact);
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
                variables: { id },
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
            await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                mutation: updateBrevoContactMutation(brevoContactFormFragment),
                variables: { id, input: output, scope },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoContactMutation, GQLCreateBrevoContactMutationVariables>({
                mutation: createBrevoContactMutation(brevoContactFormFragment),
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createBrevoContact?.id;
                if (id) {
                    setTimeout(() => {
                        stackSwitchApi.activatePage("edit", id.toString());
                    });
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
                <EditPageLayout>
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
                            <FinalFormSaveSplitButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <TextField
                            required
                            fullWidth
                            name="email"
                            label={<FormattedMessage id="cometBrevoModule.brevoContact.email" defaultMessage="Email" />}
                            disabled={mode === "edit"}
                        />

                        {additionalFormFields && (
                            <Card sx={{ padding: 4 }}>
                                <FormSection title={<FormattedMessage id="cometBrevoModule.brevoContact.attributes" defaultMessage="Attributes" />}>
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
