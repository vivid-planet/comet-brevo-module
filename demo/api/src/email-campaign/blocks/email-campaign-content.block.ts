import { createBlocksBlock } from "@comet/blocks-api";

import { EmailCampaignDividerBlock } from "./email-campaign-divider.block";
import { EmailCampaignRichTextBlock } from "./email-campaign-rich-text.block";
import { EmailCampaignSalutationBlock } from "./email-campaign-salutation.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: EmailCampaignRichTextBlock,
            divider: EmailCampaignDividerBlock,
            salutation: EmailCampaignSalutationBlock,
        },
    },
    {
        name: "EmailCampaignContent",
    },
);
