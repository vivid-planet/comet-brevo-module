import { NewsletterImageBlock } from "@comet/brevo-mail-rendering";
import { BlocksBlock, SupportedBlocks } from "@comet/site-nextjs";
import { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/blocks//RichTextBlock";
import { DividerBlock } from "@src/blocks/DividerBlock";
import React from "react";

import { SalutationBlock } from "./SalutationBlock";

const supportedBlocks: SupportedBlocks = {
    divider: (data) => <DividerBlock />,
    text: (data) => <RichTextBlock data={data} />,
    salutation: (data) => <SalutationBlock data={data} />,
    image: (data) => <NewsletterImageBlock data={data} />,
};

interface Props {
    content: EmailCampaignContentBlockData;
}

export const ContentBlock = ({ content }: Props) => {
    return <BlocksBlock data={content} supportedBlocks={supportedBlocks} />;
};
