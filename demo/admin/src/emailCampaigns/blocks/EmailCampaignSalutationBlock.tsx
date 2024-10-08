import { BlockCategory, createCompositeBlock } from "@comet/blocks-admin";
import * as React from "react";
import { FormattedMessage } from "react-intl";

export const EmailCampaignSalutationBlock = createCompositeBlock({
    name: "EmailCampaignSalutation",
    displayName: <FormattedMessage id="emailCampaign.salutationBlock.displayName" defaultMessage="Salutation" />,
    category: BlockCategory.TextAndContent,
    blocks: {},
});
