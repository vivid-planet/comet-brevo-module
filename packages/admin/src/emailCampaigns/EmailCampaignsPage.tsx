import { Stack, StackPage, StackSwitch } from "@comet/admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { EmailCampaignForm } from "./EmailCampaignForm";
import { EmailCampaignsGrid } from "./EmailCampaignsGrid";

export function EmailCampaignsPage(): React.ReactElement {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "emailCampaigns.emailCampaigns", defaultMessage: "Email Campaigns" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <EmailCampaignsGrid />
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "emailCampaigns.editEmailCampaign", defaultMessage: "Edit Email Campaign" })}>
                    {(selectedId) => <EmailCampaignForm id={selectedId} />}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "emailCampaigns.addEmailCampaign", defaultMessage: "Add Email Campaign" })}>
                    <EmailCampaignForm />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
