import { createBlacklistedContactsEntity } from "@comet/brevo-api/lib/blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const BlacklistedContacts = createBlacklistedContactsEntity({ Scope: EmailCampaignContentScope });
