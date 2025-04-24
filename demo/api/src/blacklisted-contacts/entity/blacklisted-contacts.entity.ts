import { createBlacklistedContactsEntity } from "@comet/brevo-api";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const BlacklistedContacts = createBlacklistedContactsEntity({ Scope: EmailCampaignContentScope });
