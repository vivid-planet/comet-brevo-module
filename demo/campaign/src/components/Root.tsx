import { MjmlConditionalComment } from "@faire/mjml-react/extensions";
import { Mjml, MjmlAttributes, MjmlBody, MjmlDivider, MjmlHead, MjmlSection, MjmlText, MjmlTitle } from "@luma-team/mjml-react";
import { commonImageBlockStyles } from "@src/common/blocks/CommonImageBlock";
import { css } from "@src/util/stylesHelper";
import { theme } from "@src/util/theme";
import React from "react";
import { renderToString } from "react-dom/server";

import { indentedSectionGroupStyles } from "./IndentedSectionGroup";

type Props = React.PropsWithChildren<{
    title?: string;
}>;

// Fix for Outlook, which cannot load font-face and failes to use the correct fallback-font automatically.
const outlookFontFixStyleString = renderToString(
    <style type="text/css">{css`
        div,
        span,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        a,
        b {
            font-family: Helvetica, Arial, sans-serif !important;
        }
    `}</style>,
);

export const Root: React.FC<Props> = ({ children, title }) => {
    return (
        <Mjml>
            <MjmlHead>
                <MjmlAttributes>
                    <MjmlText padding={0} />
                    <MjmlDivider padding={0} />
                    <MjmlSection padding={0} />
                </MjmlAttributes>
                {!!title && <MjmlTitle>{title}</MjmlTitle>}
                {indentedSectionGroupStyles}
                {commonImageBlockStyles}
                <MjmlConditionalComment condition="if mso">{outlookFontFixStyleString}</MjmlConditionalComment>
            </MjmlHead>
            <MjmlBody width={theme.mailSize.contentWidth}>{children}</MjmlBody>
        </Mjml>
    );
};
