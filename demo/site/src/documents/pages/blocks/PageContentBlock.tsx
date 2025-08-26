import { BlocksBlock, DamVideoBlock, type PropsWithData, type SupportedBlocks, YouTubeVideoBlock } from "@comet/site-nextjs";
import { type PageContentBlockData } from "@src/blocks.generated";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { HeadlineBlock } from "@src/common/blocks/HeadlineBlock";
import { LinkListBlock } from "@src/common/blocks/LinkListBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { TextImageBlock } from "@src/common/blocks/TextImageBlock";
import { type FC } from "react";

const supportedBlocks: SupportedBlocks = {
    space: (props) => <SpaceBlock data={props} />,
    richtext: (props) => <RichTextBlock data={props} />,
    headline: (props) => <HeadlineBlock data={props} />,
    image: (props) => <DamImageBlock data={props} />,
    textImage: (props) => <TextImageBlock data={props} />,
    damVideo: (props) => <DamVideoBlock data={props} />,
    youTubeVideo: (props) => <YouTubeVideoBlock data={props} />,
    links: (props) => <LinkListBlock data={props} />,
};

export const PageContentBlock: FC<PropsWithData<PageContentBlockData>> = ({ data }) => {
    return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
};
