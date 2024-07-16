import { createBlocksBlock } from "@comet/blocks-api";
import { PixelImageBlock } from "@comet/cms-api";

import { EmailCampaignDividerBlock } from "./email-campaign-divider.block";
import { EmailCampaignRichTextBlock } from "./email-campaign-rich-text.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: EmailCampaignRichTextBlock,
            divider: EmailCampaignDividerBlock,
            image: PixelImageBlock,
        },
    },
    {
        name: "EmailCampaignContent",
    },
);
