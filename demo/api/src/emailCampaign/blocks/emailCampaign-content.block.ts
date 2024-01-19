import { createBlocksBlock } from "@comet/blocks-api";

import { EmailCampaignDividerBlock } from "./emailCampaign-divider.block";
import { EmailCampaignRichTextBlock } from "./emailCampaign-rich-text.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: EmailCampaignRichTextBlock,
            divider: EmailCampaignDividerBlock,
        },
    },
    {
        name: "EmailCampaignContent",
    },
);
