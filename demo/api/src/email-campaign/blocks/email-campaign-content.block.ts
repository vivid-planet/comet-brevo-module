import { createBlocksBlock } from "@comet/blocks-api";
import { PixelImageBlock } from "@comet/cms-api";

import { EmailCampaignDividerBlock } from "./email-campaign-divider.block";
import { EmailCampaignRichTextBlock } from "./email-campaign-rich-text.block";
import { EmailCampaignSalutationBlock } from "./email-campaign-salutation.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: EmailCampaignRichTextBlock,
            divider: EmailCampaignDividerBlock,
            salutation: EmailCampaignSalutationBlock,
            image: PixelImageBlock,
        },
    },
    {
        name: "EmailCampaignContent",
    },
);
