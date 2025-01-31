import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FieldSet,
    FinalForm,
    FinalFormInput,
    FinalFormSaveButton,
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
} from "@comet/admin";
import { ArrowLeft } from "@comet/admin-icons";
import { ContentScopeIndicator, ContentScopeInterface, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

export { namedOperations as targetGroupFormNamedOperations } from "./TargetGroupForm.gql.generated";

import { AddContactsGridSelect } from "./addContacts/AddContactsGridSelect";
import { AllAssignedContactsGrid } from "./allAssignedContacts/AllAssignedContactsGrid";
import { targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupForm.gql";
import {
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
    id: string;
    scope: ContentScopeInterface;
    additionalFormFields?: React.ReactNode;
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function TargetGroupForm({ id, scope, additionalFormFields, input2State, nodeFragment }: FormProps): React.ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = "edit";
    const formApiRef = useFormApiRef<EditTargetGroupFinalFormValues>();

    let targetGroupFormFragment: DocumentNode | undefined;
    if (additionalFormFields && nodeFragment) {
        targetGroupFormFragment = gql`
            fragment TargetGroupForm on TargetGroup {
                ${"...".concat(nodeFragment.name)}
            }
            ${nodeFragment.fragment}
        `;
    }

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(
        targetGroupFormQuery(targetGroupFormFragment),
        { variables: { id } },
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

        await client.mutate<GQLUpdateTargetGroupMutation, GQLUpdateTargetGroupMutationVariables>({
            mutation: updateTargetGroupMutation(targetGroupFormFragment),
            variables: { id, input: output, lastUpdatedAt: data?.targetGroup?.updatedAt },
        });
    };

    if (error) throw error;

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<EditTargetGroupFinalFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <>
                    {saveConflict.dialogs}
                    <Toolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
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
                            <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
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

                        <>
                            <FieldSet
                                title={
                                    <FormattedMessage id="cometBrevoModule.targetGroup.manuallyAddContacts" defaultMessage="Manually add contacts" />
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
                                    <FormattedMessage id="cometBrevoModule.targetGroup.allAssignedContacts" defaultMessage="All assigned contacts" />
                                }
                                disablePadding
                                initiallyExpanded={false}
                            >
                                <AllAssignedContactsGrid brevoId={data?.targetGroup.brevoId ?? undefined} id={id} scope={scope} />
                            </FieldSet>
                        </>
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
}
