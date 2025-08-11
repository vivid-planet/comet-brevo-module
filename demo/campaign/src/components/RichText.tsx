import { type PropsWithData } from "@comet/site-nextjs";
import { type RichTextBlockData } from "@src/blocks.generated";
import { type RawDraftContentState } from "draft-js";
import * as React from "react";
import redraft, { type Renderers, type TextBlockRenderFn } from "redraft";

import { Typography, type TypographyProps } from "./Typography";

function createTextBlockRenderFn(props: TypographyProps): TextBlockRenderFn {
    return (children, { keys }) =>
        children.map((child, index) => (
            <Typography key={keys[index]} {...props}>
                {child}
            </Typography>
        ));
}

export const getRenderers = (typographyProps?: Partial<TypographyProps>): Renderers => ({
    inline: {
        BOLD: (children, { key }) => <b key={key}>{children}</b>,
        ITALIC: (children, { key }) => <i key={key}>{children}</i>,
    },
    blocks: {
        unstyled: createTextBlockRenderFn({ variant: "body", ...typographyProps }),
        "header-one": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 26 }),
        "header-two": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 24 }),
        "header-three": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 22 }),
        "header-four": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 20 }),
        "header-five": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 18 }),
        "header-six": createTextBlockRenderFn({ variant: "headline", ...typographyProps, fontSize: 16, fontWeight: 600 }),
    },
});

interface Props extends PropsWithData<RichTextBlockData> {
    typographyProps?: TypographyProps;
}

export const RichText = ({ data: { draftContent }, typographyProps }: Props): React.ReactElement => {
    const rendered = redraft(draftContent, getRenderers(typographyProps));
    return <>{rendered}</>;
};

export function hasDraftContent(draftContent: RawDraftContentState) {
    return !(draftContent.blocks.length == 1 && draftContent.blocks[0].text === "");
}
