import { createRichTextBlock } from "@comet/blocks-api";

import { EmailCampaignLinkBlock } from "./email-campaign-link.block";

export const EmailCampaignRichTextBlock = createRichTextBlock({ link: EmailCampaignLinkBlock });
