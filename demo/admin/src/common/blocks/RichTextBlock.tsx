import { createRichTextBlock } from "@comet/cms-admin";

import { LinkBlock } from "./LinkBlock";

export const RichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: { supports: ["bold", "italic", "header-one", "header-two", "header-three", "header-four", "header-five", "header-six"] },
});
