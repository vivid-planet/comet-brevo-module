import { Stack, StackPage, StackSwitch } from "@comet/admin";
import { BlockInterface } from "@comet/blocks-admin";
import { useContentScope } from "@comet/cms-admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { EmailCampaignsGrid } from "./EmailCampaignsGrid";
import { EmailCampaignForm } from "./form/EmailCampaignForm";
import { EmailCampaignStatistics } from "./statistics/EmailCampaignStatistics";
import { EmailCampaignView } from "./view/EmailCampaignView";

interface CreateEmailCampaignsPageOptions {
    scopeParts: string[];
    EmailCampaignContentBlock: BlockInterface;
}

export function createEmailCampaignsPage({ scopeParts, EmailCampaignContentBlock }: CreateEmailCampaignsPageOptions) {
    function EmailCampaignsPage(): JSX.Element {
        const { scope: completeScope } = useContentScope();
        const intl = useIntl();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return (
            <Stack topLevelTitle={intl.formatMessage({ id: "cometBrevoModule.emailCampaigns.emailCampaigns", defaultMessage: "Email campaigns" })}>
                <StackSwitch>
                    <StackPage name="grid">
                        <EmailCampaignsGrid scope={scope} EmailCampaignContentBlock={EmailCampaignContentBlock} />
                    </StackPage>
                    <StackPage name="statistics">{(selectedId) => <EmailCampaignStatistics id={selectedId} />}</StackPage>
                    <StackPage name="view">
                        {(selectedId) => <EmailCampaignView id={selectedId} EmailCampaignContentBlock={EmailCampaignContentBlock} />}
                    </StackPage>

                    <StackPage
                        name="edit"
                        title={intl.formatMessage({ id: "cometBrevoModule.emailCampaigns.editEmailCampaign", defaultMessage: "Edit email campaign" })}
                    >
                        {(selectedId) => <EmailCampaignForm id={selectedId} EmailCampaignContentBlock={EmailCampaignContentBlock} scope={scope} />}
                    </StackPage>
                    <StackPage
                        name="add"
                        title={intl.formatMessage({ id: "cometBrevoModule.emailCampaigns.addEmailCampaign", defaultMessage: "Add email campaign" })}
                    >
                        <EmailCampaignForm EmailCampaignContentBlock={EmailCampaignContentBlock} scope={scope} />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }
    return EmailCampaignsPage;
}
