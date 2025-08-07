import { type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type TextLinkBlockData } from "@src/blocks.generated";

import { LinkBlock } from "./LinkBlock";

export const TextLinkBlock = withPreview(
    ({ data: { link, text } }: PropsWithData<TextLinkBlockData>) => {
        return (
            <LinkBlock data={link}>
                <a>{text}</a>
            </LinkBlock>
        );
    },
    { label: "Text link" },
);
