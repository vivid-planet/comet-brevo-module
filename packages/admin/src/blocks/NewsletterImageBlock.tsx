import { BlockCategory, createCompositeBlock } from "@comet/blocks-admin";
import { PixelImageBlock } from "@comet/cms-admin";
import React from "react";
import { FormattedMessage } from "react-intl";

export const NewsletterImageBlock = createCompositeBlock({
    name: "NewsletterImage",
    displayName: <FormattedMessage id="brevo.blocks.newsletterImage.displayName" defaultMessage="Newsletter Image" />,
    category: BlockCategory.Media,
    blocks: {
        image: {
            block: PixelImageBlock,
            title: <FormattedMessage id="brevo.blocks.newsletterImage.image" defaultMessage="Image" />,
        },
    },
});
