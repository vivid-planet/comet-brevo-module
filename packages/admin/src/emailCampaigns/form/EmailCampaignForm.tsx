import { useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
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
import {
    AdminComponentRoot,
    AdminTabLabel,
    BlockInterface,
    BlocksFinalForm,
    BlockState,
    createFinalFormBlock,
    parallelAsyncEvery,
} from "@comet/blocks-admin";
import {
    BlockPreviewWithTabs,
    ContentScopeInterface,
    EditPageLayout,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useBlockPreview,
    useCmsBlockContext,
    useEditState,
    useFormSaveConflict,
    useSaveState,
} from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { isBefore } from "date-fns";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useRouteMatch } from "react-router";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import { GQLEmailCampaignInput } from "../../graphql.generated";
import { ConfigFields } from "./ConfigFields";
import { createEmailCampaignMutation, emailCampaignFormQuery, updateEmailCampaignMutation } from "./EmailCampaignForm.gql";
import {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLEmailCampaignFormFragment,
    GQLEmailCampaignFormQuery,
    GQLEmailCampaignFormQueryVariables,
    GQLUpdateEmailCampaignMutation,
    GQLUpdateEmailCampaignMutationVariables,
} from "./EmailCampaignForm.gql.generated";
import { SendManagerFields } from "./SendManagerFields";
import { TestEmailCampaignForm } from "./TestEmailCampaignForm";

interface FormProps {
    id?: string;
    EmailCampaignContentBlock: BlockInterface;
    scope: ContentScopeInterface;
}

export function EmailCampaignForm({ id, EmailCampaignContentBlock, scope }: FormProps): React.ReactElement {
    const rootBlocks = {
        content: EmailCampaignContentBlock,
    };

    type EmailCampaignState = Omit<GQLEmailCampaignFormFragment, "content"> & {
        [key in keyof typeof rootBlocks]: BlockState<(typeof rootBlocks)[key]>;
    };

    const { previewUrl } = useBrevoConfig();
    const stackApi = useStackApi();
    const stackSwitchApi = useStackSwitchApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const previewApi = useBlockPreview();
    const formApiRef = useFormApiRef<EmailCampaignState>();
    const blockContext = useCmsBlockContext();
    const match = useRouteMatch();

    const FinalFormEmailCampaignContentBlock = useMemo(() => createFinalFormBlock(EmailCampaignContentBlock), [EmailCampaignContentBlock]);

    const { data, error, loading, refetch } = useQuery<GQLEmailCampaignFormQuery, GQLEmailCampaignFormQueryVariables>(
        emailCampaignFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const { state, setState, hasChanges, output, query, updateReferenceContent } = useEditState<
        GQLEmailCampaignFormQuery,
        GQLEmailCampaignFormQueryVariables,
        EmailCampaignState,
        GQLEmailCampaignInput
    >({
        query: emailCampaignFormQuery,
        variables: id ? { id } : undefined,
        mode,
        input2State: ({ emailCampaign }) => {
            return {
                title: emailCampaign?.title,
                subject: emailCampaign?.subject,
                content: EmailCampaignContentBlock.input2State(emailCampaign.content),
                scheduledAt: emailCampaign?.scheduledAt ? new Date(emailCampaign.scheduledAt) : null,
                sendingState: emailCampaign?.sendingState,
                targetGroups: emailCampaign?.targetGroups,
            };
        },
        state2Output: (state) => ({
            ...state,
            content: EmailCampaignContentBlock.state2Output(state.content),
            scheduledAt: state.targetGroups.length > 0 ? state.scheduledAt ?? null : null,
            sendingState: undefined,
            targetGroups: state.targetGroups.map((targetGroup) => targetGroup.id),
        }),
        defaultState: {
            title: "",
            subject: "",
            content: EmailCampaignContentBlock.defaultValues(),
            sendingState: "DRAFT",
            scheduledAt: undefined,
            targetGroups: [],
        },
    });

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "emailCampaign", id);
            return resolveHasSaveConflict(data?.emailCampaign.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const { saveButton } = useSaveState<{ emailCampaign: GQLEmailCampaignFormFragment & { id: string } }>({
        hasChanges,
        saveConflict,
        mode,
        validate: async () => {
            if (!state) return false;

            const validateBlocks = await parallelAsyncEvery(
                Object.entries(rootBlocks),
                async ([key, block]: [keyof typeof rootBlocks, BlockState<BlockInterface>]) => {
                    return block.isValid(state[key]);
                },
            );

            return validateBlocks;
        },
        save: saveEmailCampaign,
        navigateToEditPage: async (data) => {
            if (!id) {
                stackSwitchApi.activatePage(`edit`, data.emailCampaign.id);
            }
        },
        updateReferenceContent,
    });

    async function saveEmailCampaign() {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        if (!output) throw new Error("Output is required");

        if (mode === "edit") {
            if (!id) {
                throw new Error("Missing id in edit mode");
            }

            const { data: mutationResponse } = await client.mutate<GQLUpdateEmailCampaignMutation, GQLUpdateEmailCampaignMutationVariables>({
                mutation: updateEmailCampaignMutation,
                variables: { id, input: { ...output }, lastUpdatedAt: query.data?.emailCampaign?.updatedAt },
            });

            if (!mutationResponse) {
                throw new Error("Failed to update");
            }

            return mutationResponse;
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                mutation: createEmailCampaignMutation,
                variables: { scope, input: { ...output, targetGroups: output.targetGroups } },
            });

            if (!mutationResponse) {
                throw new Error("Failed to create");
            }

            return mutationResponse;
        }
    }

    if (!state) {
        return <></>;
    }

    if (error) throw error;

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    const previewContext = {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    };

    const previewState = {
        emailCampaignId: id,
        scope,
        content: EmailCampaignContentBlock.createPreviewState(state.content, previewContext),
    };

    const isScheduledDateInPast = state.scheduledAt != undefined && isBefore(new Date(state.scheduledAt), new Date());
    const isSchedulingDisabled = state.sendingState === "SENT" || mode === "add" || state.targetGroups.length === 0 || isScheduledDateInPast;

    return (
        <EditPageLayout>
            {saveConflict.dialogs}
            <Toolbar>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack}>
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <ToolbarTitleItem>
                    <FormattedMessage id="cometBrevoModule.emailCampaigns.EmailCampaign" defaultMessage="Email Campaign" />
                </ToolbarTitleItem>
                <ToolbarFillSpace />
                <ToolbarActions>{saveButton}</ToolbarActions>
            </Toolbar>
            <MainContent disablePaddingBottom>
                <BlockPreviewWithTabs previewUrl={previewUrl} previewState={previewState} previewApi={previewApi}>
                    {[
                        {
                            key: "config",
                            label: (
                                <AdminTabLabel>
                                    <FormattedMessage id="cometBrevoModule.emailCampaigns.config" defaultMessage="Config" />
                                </AdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) => setState({ ...state, ...values })}
                                    initialValues={{
                                        title: state.title,
                                        subject: state.subject,
                                    }}
                                >
                                    <ConfigFields />
                                </BlocksFinalForm>
                            ),
                        },
                        {
                            key: "blocks",
                            label: (
                                <AdminTabLabel>
                                    <FormattedMessage id="cometBrevoModule.emailCampaigns.blocks" defaultMessage="Blocks" />
                                </AdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) => setState({ ...state, ...values })}
                                    initialValues={{
                                        content: state?.content,
                                    }}
                                >
                                    <AdminComponentRoot>
                                        <Field name="content" fullWidth required component={FinalFormEmailCampaignContentBlock} />
                                    </AdminComponentRoot>
                                </BlocksFinalForm>
                            ),
                        },
                        {
                            key: "send-manager",
                            label: (
                                <AdminTabLabel>
                                    <FormattedMessage id="cometBrevoModule.emailCampaigns.sendManager" defaultMessage="Send manager" />
                                </AdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) => setState({ ...state, scheduledAt: values.scheduledAt, targetGroups: values.targetGroups })}
                                    initialValues={{
                                        targetGroups: state.targetGroups,
                                        scheduledAt: state.scheduledAt,
                                    }}
                                >
                                    <SendManagerFields
                                        scope={scope}
                                        isSchedulingDisabled={isSchedulingDisabled}
                                        isSendable={!hasChanges && state.targetGroups != undefined}
                                        id={id}
                                    />
                                    <TestEmailCampaignForm id={id} isSendable={!hasChanges && state.targetGroups != undefined} scope={scope} />
                                </BlocksFinalForm>
                            ),
                        },
                    ]}
                </BlockPreviewWithTabs>
            </MainContent>
        </EditPageLayout>
    );
}
