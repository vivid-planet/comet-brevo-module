import { createEmailCampaignEntity } from "@comet/brevo-api/lib/email-campaign/entities/email-campaign-entity.factory";
import { TargetGroup } from "@src/target-group/entity/target-group.entity";

import { EmailCampaignContentBlock } from "../blocks/email-campaign-content.block";
import { EmailCampaignContentScope } from "../email-campaign-content-scope";

export const EmailCampaign = createEmailCampaignEntity({
    EmailCampaignContentBlock: EmailCampaignContentBlock,
    Scope: EmailCampaignContentScope,
    TargetGroup: TargetGroup,
});
