import { PropsWithData } from "@comet/cms-site";
import { MjmlColumn } from "@luma-team/mjml-react";
import { PixelImageBlockData } from "@src/blocks.generated";
import { CommonImageBlock } from "@src/common/blocks/CommonImageBlock";
import { IndentedSectionGroup } from "@src/components/IndentedSectionGroup";
import { theme } from "@src/util/theme";

export const ImageBlock = ({ data }: PropsWithData<PixelImageBlockData>) => {
    return (
        <IndentedSectionGroup paddingLeft={0} paddingRight={0}>
            <MjmlColumn>
                <CommonImageBlock data={data} desktopRenderWidth={theme.mailSize.contentWidth} />
            </MjmlColumn>
        </IndentedSectionGroup>
    );
};
