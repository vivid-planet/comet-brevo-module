import { createTargetGroupEntity } from "@comet/brevo-api/lib/target-group/entity/target-group-entity.factory";
import { BrevoContactFilterAttributes } from "@src/brevo-contact/dto/brevo-contact-attributes";
import { EmailCampaignContentScope } from "@src/email-campaign/email-campaign-content-scope";

export const TargetGroup = createTargetGroupEntity({ Scope: EmailCampaignContentScope, BrevoFilterAttributes: BrevoContactFilterAttributes });
