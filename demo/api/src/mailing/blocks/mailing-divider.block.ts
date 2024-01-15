import { BlockData, BlockInput, createBlock, inputToData } from "@comet/blocks-api";

class MailingDividerBlockData extends BlockData {}

class MailingDividerBlockInput extends BlockInput {
    transformToBlockData(): MailingDividerBlockData {
        return inputToData(MailingDividerBlockData, this);
    }
}

export const MailingDividerBlock = createBlock(MailingDividerBlockData, MailingDividerBlockInput, "MailingDivider");
