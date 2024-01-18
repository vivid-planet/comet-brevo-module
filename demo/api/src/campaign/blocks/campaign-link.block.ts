import { createOneOfBlock, ExternalLinkBlock } from "@comet/blocks-api";

export const CampaignLinkBlock = createOneOfBlock({ supportedBlocks: { external: ExternalLinkBlock }, allowEmpty: true }, "CampaignLink");
