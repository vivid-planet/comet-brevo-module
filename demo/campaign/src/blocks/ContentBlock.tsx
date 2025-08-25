import { NewsletterImageBlock } from "@comet/brevo-mail-rendering";
import { BlocksBlock, type SupportedBlocks } from "@comet/site-nextjs";
import { type EmailCampaignContentBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/blocks//RichTextBlock";
import { DividerBlock } from "@src/blocks/DividerBlock";

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
