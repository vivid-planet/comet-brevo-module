import { BlockData, BlockInput, createBlock, inputToData } from "@comet/blocks-api";

class EmailCampaignDividerBlockData extends BlockData {}

class EmailCampaignDividerBlockInput extends BlockInput {
    transformToBlockData(): EmailCampaignDividerBlockData {
        return inputToData(EmailCampaignDividerBlockData, this);
    }
}

export const EmailCampaignDividerBlock = createBlock(EmailCampaignDividerBlockData, EmailCampaignDividerBlockInput, "EmailCampaignDivider");
