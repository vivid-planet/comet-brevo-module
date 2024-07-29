import { calculateInheritAspectRatio, generateImageUrl } from "@comet/cms-site";
import { MjmlImage, MjmlStyle } from "@luma-team/mjml-react";
import { PixelImageBlockData } from "@src/blocks.generated";
import { css } from "@src/util/stylesHelper";
import { theme } from "@src/util/theme";
import * as React from "react";

import { getDamAllowedImageWidth } from "../helpers/imageBlockHelpers";

interface Props extends React.ComponentProps<typeof MjmlImage> {
    data: PixelImageBlockData;
    desktopRenderWidth: number;
}

export const commonImageBlockStyles = (
    <MjmlStyle>{css`
        @media (max-width: ${theme.mailSize.contentWidth - 1}px) {
            .image-block > table > tbody > tr > td {
                width: 100% !important;
            }

            .image-block img {
                height: auto !important;
            }
        }
    `}</MjmlStyle>
);

export const CommonImageBlock = ({ data, desktopRenderWidth, ...restProps }: Props) => {
    const { damFile, cropArea, urlTemplate } = data;

    if (!damFile?.image) {
        return null;
    }

    const usedCropArea = cropArea ?? damFile.image.cropArea;
    const usedAspectRatio = calculateInheritAspectRatio(damFile.image, usedCropArea);

    const imageUrl: string = generateImageUrl(
        {
            width: getDamAllowedImageWidth(desktopRenderWidth),
            src: urlTemplate,
        },
        usedAspectRatio,
    );

    const desktopImageHeight = Math.round(desktopRenderWidth / usedAspectRatio);

    const imageClassNames = ["image-block"];

    return (
        <MjmlImage
            src={imageUrl}
            fluidOnMobile="true"
            cssClass={imageClassNames.join(" ")}
            width={desktopRenderWidth}
            height={desktopImageHeight}
            alt={damFile.altText}
            title={damFile.title}
            {...restProps}
        />
    );
};
