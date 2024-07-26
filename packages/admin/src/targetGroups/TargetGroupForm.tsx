import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FieldSet,
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

export { namedOperations as targetGroupFormNamedOperations } from "./TargetGroupForm.gql.generated";

import { AddContactsGridSelect } from "./addContacts/AddContactsGridSelect";
import { AllAssignedContactsGrid } from "./allAssignedContacts/AllAssignedContactsGrid";
import { createTargetGroupMutation, targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupForm.gql";
import {
    GQLCreateTargetGroupMutation,
    GQLCreateTargetGroupMutationVariables,
    GQLTargetGroupFormQuery,
    GQLTargetGroupFormQueryVariables,
    GQLUpdateTargetGroupMutation,
    GQLUpdateTargetGroupMutationVariables,
} from "./TargetGroupForm.gql.generated";

export interface EditTargetGroupFinalFormValues {
    title: string;
    [key: string]: unknown;
}

interface FormProps {
    id?: string;
    scope: ContentScopeInterface;
    additionalFormFields?: React.ReactNode;
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function TargetGroupForm({ id, scope, additionalFormFields, input2State, nodeFragment }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<EditTargetGroupFinalFormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const targetGroupFormFragment = gql`
        fragment TargetGroupForm on TargetGroup {
            ${nodeFragment ? "...".concat(nodeFragment?.name) : ""}
        }
        ${nodeFragment?.fragment ?? ""}
    `;

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(
        targetGroupFormQuery(targetGroupFormFragment),
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = React.useMemo<Partial<EditTargetGroupFinalFormValues>>(() => {
        let additionalInitialValues = {};

        if (input2State) {
            additionalInitialValues = input2State(data?.targetGroup);
        }

        return data?.targetGroup ? { title: data.targetGroup.title, ...additionalInitialValues } : additionalInitialValues;
    }, [data?.targetGroup, input2State]);

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

    const handleSubmit = async (
        state: EditTargetGroupFinalFormValues,
        form: FormApi<EditTargetGroupFinalFormValues>,
        event: FinalFormSubmitEvent,
    ) => {
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
                mutation: updateTargetGroupMutation(targetGroupFormFragment),
                variables: { id, input: output, lastUpdatedAt: data?.targetGroup?.updatedAt },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                mutation: createTargetGroupMutation(targetGroupFormFragment),
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
        <FinalForm<EditTargetGroupFinalFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
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
                        {additionalFormFields && (
                            <FieldSet
                                title={<FormattedMessage id="cometBrevoModule.targetGroup.filters" defaultMessage="Filters" />}
                                supportText={
                                    <FormattedMessage
                                        id="cometBrevoModule.targetGroup.filters.explainText"
                                        defaultMessage="Contacts will get assigned automatically to this target group depending on their attributes"
                                    />
                                }
                                initiallyExpanded
                            >
                                {additionalFormFields}
                            </FieldSet>
                        )}
                        {id && (
                            <>
                                <FieldSet
                                    title={
                                        <FormattedMessage
                                            id="cometBrevoModule.targetGroup.manuallyAddContacts"
                                            defaultMessage="Manually add contacts"
                                        />
                                    }
                                    initiallyExpanded
                                    disablePadding
                                >
                                    <AddContactsGridSelect
                                        assignedContactsTargetGroupBrevoId={data?.targetGroup.assignedContactsTargetGroupBrevoId ?? undefined}
                                        id={id}
                                        scope={scope}
                                    />
                                </FieldSet>
                                <FieldSet
                                    title={
                                        <FormattedMessage
                                            id="cometBrevoModule.targetGroup.allAssignedContacts"
                                            defaultMessage="All assigned contacts"
                                        />
                                    }
                                    initiallyExpanded
                                    disablePadding
                                >
                                    <AllAssignedContactsGrid
                                        assignedContactsTargetGroupBrevoId={data?.targetGroup.assignedContactsTargetGroupBrevoId ?? undefined}
                                        id={id}
                                        scope={scope}
                                    />
                                </FieldSet>
                            </>
                        )}
                    </MainContent>
                </EditPageLayout>
            )}
        </FinalForm>
    );
}
