import { BlocksBlock, SupportedBlocks } from "@comet/cms-site";
import { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/blocks//RichTextBlock";
import { DividerBlock } from "@src/blocks/DividerBlock";
import React from "react";

import { SalutationBlock } from "./SalutationBlock";

const supportedBlocks: SupportedBlocks = {
    divider: (data) => <DividerBlock />,
    text: (data) => <RichTextBlock data={data} />,
    salutation: (data) => <SalutationBlock data={data} />,
};

interface Props {
    content: EmailCampaignContentBlockData;
}

export const ContentBlock = ({ content }: Props) => {
    return <BlocksBlock data={content} supportedBlocks={supportedBlocks} />;
};
