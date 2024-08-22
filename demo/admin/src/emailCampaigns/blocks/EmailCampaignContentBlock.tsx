import { createBlocksBlock } from "@comet/blocks-admin";
import { PixelImageBlock } from "@comet/cms-admin";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

import { DividerBlock } from "./DividerBlock";

export const EmailCampaignContentBlock = createBlocksBlock({
    name: "EmailCampaignContent",
    supportedBlocks: {
        divider: DividerBlock,
        text: RichTextBlock,
        image: PixelImageBlock,
    },
});
