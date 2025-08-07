import { PropsWithData } from "@comet/site-nextjs";
import { MjmlColumn, MjmlSection } from "@luma-team/mjml-react";
import { PixelImageBlockData } from "@src/blocks.generated";
import { CommonImageBlock } from "@src/common/blocks/CommonImageBlock";
import { theme } from "@src/util/theme";

export const ImageBlock = ({ data }: PropsWithData<PixelImageBlockData>) => {
    return (
        <MjmlSection>
            <MjmlColumn>
                <CommonImageBlock data={data} desktopRenderWidth={theme.mailSize.contentWidth} />
            </MjmlColumn>
        </MjmlSection>
    );
};
