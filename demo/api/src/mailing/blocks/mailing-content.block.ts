import { createBlocksBlock } from "@comet/blocks-api";

import { MailingDividerBlock } from "./mailing-divider.block";
import { MailingRichTextBlock } from "./mailing-rich-text.block";

export const MailingContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: MailingRichTextBlock,
            divider: MailingDividerBlock,
        },
    },
    {
        name: "MailingContent",
    },
);
