import { createBrevoEmailImportLogEntity } from "@comet/brevo-api/lib/brevo-email-import-log/entity/brevo-email-input-log.entity.factory";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const BrevoEmailImportLog = createBrevoEmailImportLogEntity({ Scope: EmailCampaignContentScope });
