import { BlockData, BlockInput, createBlock, inputToData } from "@comet/blocks-api";

class EmailCampaignSalutationBlockData extends BlockData {}

class EmailCampaignSalutationBlockInput extends BlockInput {
    transformToBlockData(): EmailCampaignSalutationBlockData {
        return inputToData(EmailCampaignSalutationBlockData, this);
    }
}

export const EmailCampaignSalutationBlock = createBlock(
    EmailCampaignSalutationBlockData,
    EmailCampaignSalutationBlockInput,
    "EmailCampaignSalutation",
);
