import { createBrevoContactLogEntity } from "@comet/brevo-api/lib/brevo-contact-log/entity/brevo-contact-log.entity.factory";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const BrevoContactLog = createBrevoContactLogEntity({ Scope: EmailCampaignContentScope });
