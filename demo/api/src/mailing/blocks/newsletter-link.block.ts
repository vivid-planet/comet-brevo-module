import { createOneOfBlock, ExternalLinkBlock } from "@comet/blocks-api";

export const MailingLinkBlock = createOneOfBlock({ supportedBlocks: { external: ExternalLinkBlock }, allowEmpty: true }, "MailingLink");
