import { ExternalLinkBlock, InternalLinkBlock, PropsWithData, withPreview } from "@comet/site-nextjs";
import { ExternalLinkBlockData, InternalLinkBlockData, LinkBlockData } from "@src/blocks.generated";
import * as React from "react";

interface LinkBlockProps extends PropsWithData<LinkBlockData> {
    children: React.ReactElement;
}

export const LinkBlock = withPreview(
    ({ data: { block }, children }: LinkBlockProps) => {
        if (!block) {
            return null;
        }

        if (block.type === "internal") {
            return (
                <InternalLinkBlock data={block.props as InternalLinkBlockData} legacyBehavior>
                    {children}
                </InternalLinkBlock>
            );
        } else {
            return (
                <ExternalLinkBlock data={block.props as ExternalLinkBlockData} legacyBehavior>
                    {children}
                </ExternalLinkBlock>
            );
        }
    },
    { label: "Link" },
);
