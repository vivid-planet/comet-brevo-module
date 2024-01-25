import { Stack, StackPage, StackSwitch } from "@comet/admin";
import { useContentScope } from "@comet/cms-admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { TargetGroupForm } from "./TargetGroupForm";
import { TargetGroupsGrid } from "./TargetGroupsGrid";

interface CreateContactsPageOptions {
    scopeParts: string[];
}

export function createTargetGroupsPage({ scopeParts }: CreateContactsPageOptions) {
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
                        <TargetGroupsGrid scope={scope} />
                    </StackPage>
                    <StackPage
                        name="edit"
                        title={intl.formatMessage({ id: "cometBrevoModule.targetGroups.editTargetGroup", defaultMessage: "Edit target group" })}
                    >
                        {(selectedId) => <TargetGroupForm id={selectedId} scope={scope} />}
                    </StackPage>
                    <StackPage
                        name="add"
                        title={intl.formatMessage({ id: "cometBrevoModule.targetGroups.addTargetGroup", defaultMessage: "Add target group" })}
                    >
                        <TargetGroupForm scope={scope} />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    return TargetGroupsPage;
}
