import {
    BlockData,
    BlockDataInterface,
    BlockInput,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
    inputToData,
} from "@comet/blocks-api";
import { PixelImageBlock } from "@comet/cms-api";
import { ValidateNested } from "class-validator";

export class NewsletterImageBlockData extends BlockData {
    @ChildBlock(PixelImageBlock)
    image: BlockDataInterface;
}
export class NewsletterImageBlockInput extends BlockInput {
    @ValidateNested()
    @ChildBlockInput(PixelImageBlock)
    image: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): NewsletterImageBlockData {
        return inputToData(NewsletterImageBlockData, this);
    }
}
export const NewsletterImageBlock = createBlock(NewsletterImageBlockData, NewsletterImageBlockInput, {
    name: "NewsletterImage",
});
