import { PreviewSkeleton, type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type DamVideoBlockData } from "@src/blocks.generated";
import * as React from "react";

export const DamVideoBlock = withPreview(
    ({ data: { damFile, autoplay, showControls } }: PropsWithData<DamVideoBlockData>) => {
        if (damFile === undefined) {
            return <PreviewSkeleton type="media" hasContent={false} />;
        }

        return (
            <video autoPlay={autoplay} controls={showControls} playsInline muted={autoplay}>
                <source src={damFile.fileUrl} type={damFile.mimetype} />
            </video>
        );
    },
    { label: "Video" },
);
