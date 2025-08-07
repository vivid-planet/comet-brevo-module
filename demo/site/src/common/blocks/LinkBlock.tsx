import { ExternalLinkBlock, InternalLinkBlock, type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type ExternalLinkBlockData, type InternalLinkBlockData, type LinkBlockData } from "@src/blocks.generated";

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
