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
import { EditPageLayout, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { useContentScope } from "@src/common/ContentScopeProvider";
import { FormApi } from "final-form";
import { filter } from "graphql-anywhere";
import React from "react";
import { FormattedMessage } from "react-intl";

import { createTargetGroupMutation, targetGroupFormFragment, targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupForm.gql";
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
}

export function TargetGroupForm({ id }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();
    const { scope } = useContentScope();

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(
        targetGroupFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<FormValues>>(
        () =>
            data?.targetGroup
                ? {
                      ...filter<GQLTargetGroupFormFragment>(targetGroupFormFragment, data.targetGroup),
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
            const { data: mutationReponse } = await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                mutation: createTargetGroupMutation,
                variables: { scope, input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationReponse?.createTargetGroup.id;
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
                            <FormattedMessage id="targetGroups.TargetGroup" defaultMessage="Target Group" />
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
                            label={<FormattedMessage id="targetGroup.title" defaultMessage="Title" />}
                        />
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
