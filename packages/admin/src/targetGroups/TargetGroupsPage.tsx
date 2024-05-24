import { Stack, StackPage, StackSwitch } from "@comet/admin";
import { useContentScope } from "@comet/cms-admin";
import { DocumentNode } from "graphql";
import * as React from "react";
import { useIntl } from "react-intl";

import { EditTargetGroupFinalFormValues, TargetGroupForm } from "./TargetGroupForm";
import { AdditionalContactAttributesType, TargetGroupsGrid } from "./TargetGroupsGrid";

interface CreateContactsPageOptions {
    scopeParts: string[];
    additionalFormFields?: React.ReactNode;
    exportTargetGroupOptions?: {
        additionalAttributesFragment: { name: string; fragment: DocumentNode };
        exportFields: { renderValue: (row: AdditionalContactAttributesType) => string; headerName: string }[];
    };
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
    valuesToOutput?: (values: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function createTargetGroupsPage({
    scopeParts,
    additionalFormFields,
    nodeFragment,
    input2State,
    exportTargetGroupOptions,
}: CreateContactsPageOptions) {
    function TargetGroupsPage(): JSX.Element {
        const { scope: completeScope } = useContentScope();
        const intl = useIntl();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return (
            <Stack topLevelTitle={intl.formatMessage({ id: "cometBrevoModule.targetGroups.targetGroups", defaultMessage: "Target groups" })}>
                <StackSwitch>
                    <StackPage name="grid">
                        <TargetGroupsGrid scope={scope} exportTargetGroupOptions={exportTargetGroupOptions} />
                    </StackPage>
                    <StackPage
                        name="edit"
                        title={intl.formatMessage({ id: "cometBrevoModule.targetGroups.editTargetGroup", defaultMessage: "Edit target group" })}
                    >
                        {(selectedId) => (
                            <TargetGroupForm
                                id={selectedId}
                                scope={scope}
                                additionalFormFields={additionalFormFields}
                                nodeFragment={nodeFragment}
                                input2State={input2State}
                            />
                        )}
                    </StackPage>
                    <StackPage
                        name="add"
                        title={intl.formatMessage({ id: "cometBrevoModule.targetGroups.addTargetGroup", defaultMessage: "Add target group" })}
                    >
                        <TargetGroupForm
                            scope={scope}
                            additionalFormFields={additionalFormFields}
                            nodeFragment={nodeFragment}
                            input2State={input2State}
                        />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    return TargetGroupsPage;
}
