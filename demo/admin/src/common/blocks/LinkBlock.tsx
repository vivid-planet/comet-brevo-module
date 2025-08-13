import { type BlockInterface, createOneOfBlock } from "@comet/blocks-admin";
import { ExternalLinkBlock, InternalLinkBlock } from "@comet/cms-admin";
import { FormattedMessage } from "react-intl";

export const LinkBlock: BlockInterface = createOneOfBlock({
    supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock },
    name: "Link",
    displayName: <FormattedMessage id="blocks.link" defaultMessage="Link" />,
    allowEmpty: false,
});
