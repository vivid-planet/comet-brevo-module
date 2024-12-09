import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FinalForm,
    FinalFormAutocomplete,
    FinalFormSaveSplitButton,
    FinalFormSubmitEvent,
    Loading,
    MainContent,
    NumberField,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarTitleItem,
    Tooltip,
    useFormApiRef,
    useStackSwitchApi,
} from "@comet/admin";
import { Info } from "@comet/admin-icons";
import { ContentScopeIndicator, ContentScopeInterface, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { brevoConfigFormQuery, createBrevoConfigMutation, sendersSelectQuery, updateBrevoConfigMutation } from "./BrevoConfigForm.gql";
import {
    GQLBrevoConfigFormQuery,
    GQLBrevoConfigFormQueryVariables,
    GQLCreateBrevoConfigMutation,
    GQLCreateBrevoConfigMutationVariables,
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
    sender: Option;
    folderId: number;
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

    const {
        data: sendersData,
        error: senderError,
        loading: senderLoading,
    } = useQuery<GQLSendersSelectQuery, GQLSendersSelectQueryVariables>(sendersSelectQuery, {
        variables: { scope },
    });

    const senderOptions =
        sendersData?.senders?.map((sender) => ({
            value: sender.email,
            label: `${sender.name} (${sender.email})`,
        })) ?? [];

    const mode = data?.brevoConfig?.id ? "edit" : "add";

    const initialValues = React.useMemo<Partial<FormValues>>(() => {
        const sender = sendersData?.senders?.find((s) => s.email === data?.brevoConfig?.senderMail && s.name === data?.brevoConfig?.senderName);
        return sender
            ? {
                  sender: {
                      value: sender.id,
                      label: `${sender.name} (${sender.email})`,
                  },
                  folderId: data?.brevoConfig?.folderId ?? 1,
              }
            : {};
    }, [data?.brevoConfig?.folderId, data?.brevoConfig?.senderMail, data?.brevoConfig?.senderName, sendersData?.senders]);

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

        const sender = sendersData?.senders?.find((s) => s.email === state.sender.value);

        if (!sender) {
            throw new Error("No sender selected");
        }

        const output = {
            senderName: sender?.name,
            senderMail: sender?.email,
            folderId: state.folderId ?? 1,
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

    if (error || senderError) throw error ?? senderError;

    if (loading || senderLoading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<FormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => {
                return (
                    <>
                        {saveConflict.dialogs}
                        <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                            <ToolbarTitleItem>
                                <FormattedMessage id="cometBrevoModule.brevoConfig.title" defaultMessage="Brevo config" />
                            </ToolbarTitleItem>
                            <ToolbarFillSpace />
                            <ToolbarActions>
                                <FinalFormSaveSplitButton hasConflict={saveConflict.hasConflict} />
                            </ToolbarActions>
                        </Toolbar>
                        <MainContent>
                            <Field
                                component={FinalFormAutocomplete}
                                getOptionLabel={(option: Option) => option.label}
                                isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                options={senderOptions}
                                name="sender"
                                label={<FormattedMessage id="cometBrevoModule.brevoConfig.sender" defaultMessage="Sender" />}
                                fullWidth
                            />
                            <NumberField
                                name="folderId"
                                defaultValue={1}
                                label={
                                    <>
                                        <FormattedMessage id="cometBrevoModule.brevoConfig.folderId" defaultMessage="Folder ID" />
                                        <Tooltip
                                            title={
                                                <FormattedMessage
                                                    id="cometBrevoModule.brevoConfig.folderId.info"
                                                    defaultMessage="By default, the folder ID should be set to 1 unless you have specifically configured another folder in Brevo."
                                                />
                                            }
                                            sx={{ marginLeft: "5px" }}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </>
                                }
                                fullWidth
                                required
                            />
                        </MainContent>
                    </>
                );
            }}
        </FinalForm>
    );
}
