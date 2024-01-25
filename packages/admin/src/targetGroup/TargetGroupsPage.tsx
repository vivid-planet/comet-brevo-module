import { Stack, StackPage, StackSwitch } from "@comet/admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { TargetGroupForm } from "./TargetGroupForm";
import { TargetGroupsGrid } from "./TargetGroupsGrid";

export function TargetGroupsPage(): React.ReactElement {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "targetGroups.targetGroups", defaultMessage: "Target Groups" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <TargetGroupsGrid />
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "targetGroups.editTargetGroup", defaultMessage: "Edit Target Group" })}>
                    {(selectedId) => <TargetGroupForm id={selectedId} />}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "targetGroups.addTargetGroup", defaultMessage: "Add Target Group" })}>
                    <TargetGroupForm />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
