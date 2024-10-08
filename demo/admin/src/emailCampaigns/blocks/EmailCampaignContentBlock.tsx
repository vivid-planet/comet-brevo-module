import { createBlocksBlock } from "@comet/blocks-admin";
import { PixelImageBlock } from "@comet/cms-admin";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

import { DividerBlock } from "./DividerBlock";
import { EmailCampaignSalutationBlock } from "./EmailCampaignSalutationBlock";

export const EmailCampaignContentBlock = createBlocksBlock({
    name: "EmailCampaignContent",
    supportedBlocks: {
        divider: DividerBlock,
        text: RichTextBlock,
        salutation: EmailCampaignSalutationBlock,
        image: PixelImageBlock,
    },
});
