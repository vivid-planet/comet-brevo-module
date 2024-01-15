import { createRichTextBlock } from "@comet/blocks-api";

import { MailingLinkBlock } from "./newsletter-link.block";

export const MailingRichTextBlock = createRichTextBlock({ link: MailingLinkBlock });
