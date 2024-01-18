import { BlockData, BlockInput, createBlock, inputToData } from "@comet/blocks-api";

class CampaignDividerBlockData extends BlockData {}

class CampaignDividerBlockInput extends BlockInput {
    transformToBlockData(): CampaignDividerBlockData {
        return inputToData(CampaignDividerBlockData, this);
    }
}

export const CampaignDividerBlock = createBlock(CampaignDividerBlockData, CampaignDividerBlockInput, "CampaignDivider");
