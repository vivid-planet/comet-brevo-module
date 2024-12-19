import { PropsWithData } from "@comet/cms-site";
import { MjmlColumn, MjmlSection } from "@luma-team/mjml-react";

import { NewsletterImageBlockData } from "../blocks.generated";
import { CommonImageBlock } from "./CommonImageBlock";

interface NewsletterImageBlockProps extends PropsWithData<NewsletterImageBlockData> {
    desktopRenderWidth?: number;
}

export const NewsletterImageBlock = ({ data, desktopRenderWidth }: NewsletterImageBlockProps) => {
    return (
        <MjmlSection>
            <MjmlColumn>
                <CommonImageBlock data={data.image} desktopRenderWidth={desktopRenderWidth} />
            </MjmlColumn>
        </MjmlSection>
    );
};
