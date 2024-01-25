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
import { ArrowLeft } from "@comet/admin-icons";
import { ContentScopeInterface, EditPageLayout, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { createTargetGroupMutation, targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupForm.gql";
import {
    GQLCreateTargetGroupMutation,
    GQLCreateTargetGroupMutationVariables,
    GQLTargetGroupFormFragment,
    GQLTargetGroupFormQuery,
    GQLTargetGroupFormQueryVariables,
    GQLUpdateTargetGroupMutation,
    GQLUpdateTargetGroupMutationVariables,
} from "./TargetGroupForm.gql.generated";

type FormValues = GQLTargetGroupFormFragment;

interface FormProps {
    id?: string;
    scope: ContentScopeInterface;
}

export function TargetGroupForm({ id, scope }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(
        targetGroupFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<FormValues>>(
        () =>
            data?.targetGroup
                ? {
                      title: data.targetGroup.title,
                  }
                : {},
        [data],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "targetGroup", id);
            return resolveHasSaveConflict(data?.targetGroup.updatedAt, updatedAt);
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
            await client.mutate<GQLUpdateTargetGroupMutation, GQLUpdateTargetGroupMutationVariables>({
                mutation: updateTargetGroupMutation,
                variables: { id, input: output, lastUpdatedAt: data?.targetGroup?.updatedAt },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                mutation: createTargetGroupMutation,
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createTargetGroup.id;
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
                            <FormattedMessage id="cometBrevoModule.targetGroups.TargetGroup" defaultMessage="Target group" />
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
                            label={<FormattedMessage id="cometBrevoModule.targetGroup.title" defaultMessage="Title" />}
                        />
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
