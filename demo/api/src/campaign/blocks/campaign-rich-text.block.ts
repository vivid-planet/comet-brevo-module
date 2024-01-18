import { createRichTextBlock } from "@comet/blocks-api";

import { CampaignLinkBlock } from "./campaign-link.block";

export const CampaignRichTextBlock = createRichTextBlock({ link: CampaignLinkBlock });
