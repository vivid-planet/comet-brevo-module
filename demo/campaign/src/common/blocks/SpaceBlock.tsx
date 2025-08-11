import { type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type SpaceBlockData } from "@src/blocks.generated";
import * as React from "react";

export const SpaceBlock = withPreview(
    ({ data: { height } }: PropsWithData<SpaceBlockData>) => {
        return <div style={{ height: `${height}px` }} />;
    },
    { label: "Space" },
);
