import { createBrevoEmailImportLogEntity } from "@comet/brevo-api";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const BrevoEmailImportLog = createBrevoEmailImportLogEntity({ Scope: EmailCampaignContentScope });
