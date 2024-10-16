import { useApolloClient, useQuery } from "@apollo/client";
import {
    FinalForm,
    FinalFormSaveSplitButton,
    FinalFormSubmitEvent,
    Loading,
    MainContent,
    TextField,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarTitleItem,
    useFormApiRef,
    useStackSwitchApi,
} from "@comet/admin";
import { ContentScopeInterface, EditPageLayout, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { brevoConfigFormQuery, createBrevoConfigMutation, updateBrevoConfigMutation } from "./BrevoConfigForm.gql";
import {
    GQLBrevoConfigFormFragment,
    GQLBrevoConfigFormQuery,
    GQLBrevoConfigFormQueryVariables,
    GQLCreateBrevoConfigMutation,
    GQLCreateBrevoConfigMutationVariables,
    GQLUpdateBrevoConfigMutation,
    GQLUpdateBrevoConfigMutationVariables,
} from "./BrevoConfigForm.gql.generated";

type FormValues = GQLBrevoConfigFormFragment;

interface FormProps {
    scope: ContentScopeInterface;
}

export function BrevoConfigForm({ scope }: FormProps): React.ReactElement {
    const client = useApolloClient();
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLBrevoConfigFormQuery, GQLBrevoConfigFormQueryVariables>(brevoConfigFormQuery, {
        variables: { scope },
    });

    const mode = data?.brevoConfig?.id ? "edit" : "add";

    const initialValues = React.useMemo<Partial<FormValues>>(
        () =>
            data?.brevoConfig
                ? {
                      ...data.brevoConfig,
                  }
                : {},
        [data],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "brevoConfig", data?.brevoConfig?.id);
            return resolveHasSaveConflict(data?.brevoConfig?.updatedAt, updatedAt);
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
            senderName: state.senderName.trim(),
            senderMail: state.senderMail.trim(),
        };

        if (mode === "edit") {
            if (!data?.brevoConfig?.id) {
                throw new Error("Missing id in edit mode");
            }
            await client.mutate<GQLUpdateBrevoConfigMutation, GQLUpdateBrevoConfigMutationVariables>({
                mutation: updateBrevoConfigMutation,
                variables: { id: data?.brevoConfig?.id, input: output, lastUpdatedAt: data?.brevoConfig?.updatedAt },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoConfigMutation, GQLCreateBrevoConfigMutationVariables>({
                mutation: createBrevoConfigMutation,
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createBrevoConfig.id;
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
        <FinalForm<FormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <EditPageLayout>
                    {saveConflict.dialogs}
                    <Toolbar>
                        <ToolbarTitleItem>
                            <FormattedMessage id="cometBrevoModule.brevoConfig.title" defaultMessage="Brevo config" />
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
                            name="senderMail"
                            label={<FormattedMessage id="cometBrevoModule.brevoConfig.senderMail" defaultMessage="Sender mail" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="senderName"
                            label={<FormattedMessage id="cometBrevoModule.brevoConfig.senderName" defaultMessage="Sender name" />}
                        />
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
