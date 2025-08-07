import { type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type LinkListBlockData } from "@src/blocks.generated";

import { TextLinkBlock } from "./TextLinkBlock";

export const LinkListBlock = withPreview(
    ({ data: { blocks } }: PropsWithData<LinkListBlockData>) => {
        return (
            <ol>
                {blocks.map((block) => (
                    <li key={block.key}>
                        <TextLinkBlock data={block.props} />
                    </li>
                ))}
            </ol>
        );
    },
    { label: "Link list" },
);
