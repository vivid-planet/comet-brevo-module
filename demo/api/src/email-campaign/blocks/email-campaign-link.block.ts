import { createOneOfBlock, ExternalLinkBlock } from "@comet/blocks-api";

export const EmailCampaignLinkBlock = createOneOfBlock({ supportedBlocks: { external: ExternalLinkBlock }, allowEmpty: true }, "EmailCampaignLink");
