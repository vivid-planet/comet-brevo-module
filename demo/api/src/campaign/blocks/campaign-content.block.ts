import { createBlocksBlock } from "@comet/blocks-api";

import { CampaignDividerBlock } from "./campaign-divider.block";
import { CampaignRichTextBlock } from "./campaign-rich-text.block";

export const CampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: CampaignRichTextBlock,
            divider: CampaignDividerBlock,
        },
    },
    {
        name: "CampaignContent",
    },
);
