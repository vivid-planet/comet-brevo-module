import { useApolloClient, useQuery } from "@apollo/client";
import {
    FinalForm,
    FinalFormSaveSplitButton,
    FinalFormSubmitEvent,
    Loading,
    MainContent,
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
import { EditPageLayout, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { FormApi } from "final-form";
import { filter } from "graphql-anywhere";
import React from "react";
import { FormattedMessage } from "react-intl";

import { brevoContactFormFragment, brevoContactFormQuery, createBrevoContactMutation, updateBrevoContactMutation } from "./BrevoContactForm.gql";
import {
    GQLBrevoContactFormFragment,
    GQLBrevoContactFormQuery,
    GQLBrevoContactFormQueryVariables,
    GQLCreateBrevoContactMutation,
    GQLCreateBrevoContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoContactForm.gql.generated";

type FormValues = GQLBrevoContactFormFragment;

interface FormProps {
    id?: string;
}

export function BrevoContactForm({ id }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLBrevoContactFormQuery, GQLBrevoContactFormQueryVariables>(
        brevoContactFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<FormValues>>(
        () =>
            data?.brevoContact
                ? {
                      ...filter<GQLBrevoContactFormFragment>(brevoContactFormFragment, data.brevoContact),
                  }
                : {},
        [data],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "brevoContact", id);
            return resolveHasSaveConflict(data?.brevoContact.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (state: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const output = {
            ...state,
        };

        if (mode === "edit") {
            if (!id) {
                throw new Error("Missing id in edit mode");
            }
            await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                mutation: updateBrevoContactMutation,
                variables: { id, input: output, lastUpdatedAt: data?.brevoContact?.updatedAt },
            });
        } else {
            const { data: mutationReponse } = await client.mutate<GQLCreateBrevoContactMutation, GQLCreateBrevoContactMutationVariables>({
                mutation: createBrevoContactMutation,
                variables: { input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationReponse?.createBrevoContact.id;
                if (id) {
                    setTimeout(() => {
                        stackSwitchApi.activatePage("edit", id);
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
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode={mode}
            initialValues={initialValues}
            onAfterSubmit={(values, form) => {
                //don't go back automatically
            }}
        >
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
                            <FormattedMessage id="brevoContacts.BrevoContact" defaultMessage="Brevo Contact" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveSplitButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent />
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
