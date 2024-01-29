import { BlockCategory, createCompositeBlock } from "@comet/blocks-admin";
import * as React from "react";
import { FormattedMessage } from "react-intl";

export const DividerBlock = createCompositeBlock({
    name: "Divider",
    displayName: <FormattedMessage id="emailCampaign.dividerBlock.displayName" defaultMessage="Divider" />,
    category: BlockCategory.Layout,
    blocks: {},
});
