import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FinalForm,
    FinalFormAutocomplete,
    FinalFormInput,
    FinalFormSaveSplitButton,
    FinalFormSubmitEvent,
    Loading,
    MainContent,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarTitleItem,
    useFormApiRef,
    useStackSwitchApi,
} from "@comet/admin";
import { ContentScopeInterface, EditPageLayout, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import {
    brevoConfigFormQuery,
    createBrevoConfigMutation,
    doiTemplatesSelectQuery,
    sendersSelectQuery,
    updateBrevoConfigMutation,
} from "./BrevoConfigForm.gql";
import {
    GQLBrevoConfigFormQuery,
    GQLBrevoConfigFormQueryVariables,
    GQLCreateBrevoConfigMutation,
    GQLCreateBrevoConfigMutationVariables,
    GQLDoiTemplatesSelectQuery,
    GQLDoiTemplatesSelectQueryVariables,
    GQLSendersSelectQuery,
    GQLSendersSelectQueryVariables,
    GQLUpdateBrevoConfigMutation,
    GQLUpdateBrevoConfigMutationVariables,
} from "./BrevoConfigForm.gql.generated";

interface Option {
    value: string;
    label: string;
}
type FormValues = {
    sender?: Option;
    apiKey?: string;
    doiTemplate?: Option;
};

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

    const {
        data: sendersData,
        error: senderError,
        loading: senderLoading,
    } = useQuery<GQLSendersSelectQuery, GQLSendersSelectQueryVariables>(sendersSelectQuery, {
        skip: mode === "add" || !data?.brevoConfig?.isApiKeySet,
    });

    const {
        data: doiTemplatesData,
        error: doiTemplatesError,
        loading: doiTemplatesLoading,
    } = useQuery<GQLDoiTemplatesSelectQuery, GQLDoiTemplatesSelectQueryVariables>(doiTemplatesSelectQuery, {
        skip: mode === "add" || !data?.brevoConfig?.isApiKeySet,
    });

    const senderOptions =
        sendersData?.senders?.map((sender) => ({
            value: sender.id,
            label: `${sender.name} (${sender.email})`,
        })) ?? [];

    const doiTemplateOptions =
        doiTemplatesData?.doiTemplates?.map((doiTemplate) => ({
            value: doiTemplate.id,
            label: `${doiTemplate.id}: ${doiTemplate.name}`,
        })) ?? [];

    const initialValues = React.useMemo<Partial<FormValues>>(() => {
        const sender = sendersData?.senders?.find(
            (sender) => sender.email === data?.brevoConfig?.senderMail && sender.name === data?.brevoConfig?.senderName,
        );
        const doiTemplate = doiTemplatesData?.doiTemplates?.find((template) => template.id === data?.brevoConfig?.doiTemplateId?.toString());

        return {
            sender: sender
                ? {
                      value: sender.id,
                      label: `${sender.name} (${sender.email})`,
                  }
                : undefined,

            doiTemplate: doiTemplate
                ? {
                      value: doiTemplate?.id,
                      label: `${doiTemplate?.id}: ${doiTemplate?.name}`,
                  }
                : undefined,
        };
    }, [
        data?.brevoConfig?.doiTemplateId,
        data?.brevoConfig?.senderMail,
        data?.brevoConfig?.senderName,
        doiTemplatesData?.doiTemplates,
        sendersData?.senders,
    ]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const query = gql`
                query ($scope: EmailCampaignContentScopeInput!) {
                    brevoConfig(scope: $scope) {
                        updatedAt
                    }
                }
            `;
            const { data } = await client.query({
                query,
                variables: { scope },
                fetchPolicy: "no-cache",
            });

            return resolveHasSaveConflict(data?.brevoConfig?.updatedAt, data.updatedAt);
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

        if (mode === "edit") {
            if (!data?.brevoConfig?.id) {
                throw new Error("Missing id in edit mode");
            }

            if (!data?.brevoConfig?.isApiKeySet) {
                if (!state.apiKey) {
                    throw new Error("Api key is required");
                }

                await client.mutate<GQLUpdateBrevoConfigMutation, GQLUpdateBrevoConfigMutationVariables>({
                    mutation: updateBrevoConfigMutation,
                    variables: { id: data?.brevoConfig?.id, input: { apiKey: state.apiKey }, lastUpdatedAt: data?.brevoConfig?.updatedAt },
                });

                return;
            }

            const sender = sendersData?.senders?.find((sender) => sender.id === state?.sender?.value);

            if (!sender || !state.doiTemplate) {
                throw new Error("Not all required fields are set");
            }

            const output = {
                senderName: sender.name,
                senderMail: sender.email,
                doiTemplateId: Number(state.doiTemplate.value),
            };

            await client.mutate<GQLUpdateBrevoConfigMutation, GQLUpdateBrevoConfigMutationVariables>({
                mutation: updateBrevoConfigMutation,
                variables: { id: data?.brevoConfig?.id, input: output, lastUpdatedAt: data?.brevoConfig?.updatedAt },
            });
        } else {
            if (!state.apiKey) {
                throw new Error("Api key is required");
            }
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoConfigMutation, GQLCreateBrevoConfigMutationVariables>({
                mutation: createBrevoConfigMutation,
                variables: { scope, input: { apiKey: state.apiKey } },
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

    if (error || senderError || doiTemplatesError) throw error ?? senderError ?? doiTemplatesError;

    if (loading || senderLoading || doiTemplatesLoading) {
        return <Loading behavior="fillPageHeight" />;
    }

    const allowAllFields = mode !== "add" && data?.brevoConfig?.isApiKeySet;

    return (
        <FinalForm<FormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => {
                return (
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
                            {!data?.brevoConfig?.isApiKeySet && (
                                <Field
                                    type="password"
                                    name="apiKey"
                                    label={
                                        <FormattedMessage
                                            id="cometBrevoModule.brevoConfig.apiKey"
                                            defaultMessage="Api key (cannot be changed afterwards)"
                                        />
                                    }
                                    component={FinalFormInput}
                                    fullWidth
                                    required
                                />
                            )}
                            {data?.brevoConfig?.isApiKeySet && (
                                <>
                                    <Field
                                        component={FinalFormAutocomplete}
                                        getOptionLabel={(option: Option) => option.label}
                                        isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                        options={senderOptions}
                                        name="sender"
                                        disabled={!allowAllFields}
                                        label={<FormattedMessage id="cometBrevoModule.brevoConfig.sender" defaultMessage="Sender" />}
                                        fullWidth
                                        required={allowAllFields}
                                    />

                                    <Field
                                        component={FinalFormAutocomplete}
                                        getOptionLabel={(option: Option) => option.label}
                                        isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                        options={doiTemplateOptions}
                                        disabled={!allowAllFields}
                                        name="doiTemplate"
                                        label={
                                            <FormattedMessage
                                                id="cometBrevoModule.brevoConfig.doiTemplate"
                                                defaultMessage="Double opt-in template id"
                                            />
                                        }
                                        fullWidth
                                        required={allowAllFields}
                                    />
                                </>
                            )}
                        </MainContent>
                    </EditPageLayout>
                );
            }}
        </FinalForm>
    );
}
