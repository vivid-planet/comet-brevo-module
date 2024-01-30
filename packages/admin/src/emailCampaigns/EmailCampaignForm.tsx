import { useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FinalForm,
    FinalFormInput,
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
import { FinalFormDatePicker } from "@comet/admin-date-time";
import { ArrowLeft } from "@comet/admin-icons";
import { BlockInterface, BlockState, createFinalFormBlock } from "@comet/blocks-admin";
import { ContentScopeInterface, EditPageLayout, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import React from "react";
import { FormattedMessage } from "react-intl";

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

interface FormProps {
    id?: string;
    EmailCampaignContentBlock: BlockInterface;
    scope: ContentScopeInterface;
}

export function EmailCampaignForm({ id, EmailCampaignContentBlock, scope }: FormProps): React.ReactElement {
    const rootBlocks = {
        content: EmailCampaignContentBlock,
    };

    type FormValues = GQLEmailCampaignFormFragment & {
        content: BlockState<typeof rootBlocks.content>;
    };

    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLEmailCampaignFormQuery, GQLEmailCampaignFormQueryVariables>(
        emailCampaignFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<FormValues>>(
        () =>
            data?.emailCampaign
                ? {
                      title: data.emailCampaign.title,
                      subject: data.emailCampaign.subject,
                      scheduledAt: data.emailCampaign.scheduledAt,
                      content: rootBlocks.content.input2State(data.emailCampaign.content),
                  }
                : {
                      content: EmailCampaignContentBlock.defaultValues(),
                  },
        [EmailCampaignContentBlock, data?.emailCampaign, rootBlocks.content],
    );

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

    const handleSubmit = async (state: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const output = {
            ...state,

            content: rootBlocks.content.state2Output(state.content),
        };

        if (mode === "edit") {
            if (!id) {
                throw new Error("Missing id in edit mode");
            }
            await client.mutate<GQLUpdateEmailCampaignMutation, GQLUpdateEmailCampaignMutationVariables>({
                mutation: updateEmailCampaignMutation,
                variables: { id, input: { ...output, targetGroup: output.targetGroup?.id }, lastUpdatedAt: data?.emailCampaign?.updatedAt },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                mutation: createEmailCampaignMutation,
                variables: { scope, input: { ...output, targetGroup: output.targetGroup?.id } },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createEmailCampaign.id;
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
                            <FormattedMessage id="emailCampaigns.EmailCampaign" defaultMessage="Email Campaign" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveSplitButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <Field
                            required
                            fullWidth
                            name="title"
                            component={FinalFormInput}
                            label={<FormattedMessage id="emailCampaign.title" defaultMessage="Title" />}
                        />
                        <Field
                            required
                            fullWidth
                            name="subject"
                            component={FinalFormInput}
                            label={<FormattedMessage id="emailCampaign.subject" defaultMessage="Subject" />}
                        />
                        <Field
                            fullWidth
                            name="scheduledAt"
                            component={FinalFormDatePicker}
                            label={<FormattedMessage id="emailCampaign.scheduledAt" defaultMessage="Scheduled At" />}
                        />
                        <Field name="content" isEqual={isEqual}>
                            {createFinalFormBlock(rootBlocks.content)}
                        </Field>
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
