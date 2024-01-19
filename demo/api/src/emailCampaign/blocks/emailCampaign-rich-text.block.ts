import { createRichTextBlock } from "@comet/blocks-api";

import { EmailCampaignLinkBlock } from "./emailCampaign-link.block";

export const EmailCampaignRichTextBlock = createRichTextBlock({ link: EmailCampaignLinkBlock });
