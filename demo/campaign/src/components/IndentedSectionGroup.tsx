import { MjmlGroup, MjmlSection, MjmlStyle } from "@luma-team/mjml-react";
import { css } from "@src/util/stylesHelper";
import { theme } from "@src/util/theme";
import * as React from "react";

export interface IndentedSectionGroupProps extends React.ComponentProps<typeof MjmlSection> {
    children?: React.ReactNode;
    cssClass?: string;
}

export const indentedSectionGroupStyles = (
    <MjmlStyle>{css`
        @media (max-width: ${theme.mailSize.mailWidth - 1}px) {
            .indented-section__group {
                width: 100% !important;
                max-width: ${theme.mailSize.contentWidth};
            }
        }
    `}</MjmlStyle>
);

export const IndentedSectionGroup = ({ children, cssClass, ...restProps }: IndentedSectionGroupProps) => {
    return (
        <MjmlSection
            cssClass={(`${cssClass || ""}`.trim(), "indented-section")}
            paddingLeft={theme.mailSize.contentSpacing}
            paddingRight={theme.mailSize.contentSpacing}
            backgroundColor={theme.colors.background.content}
            {...restProps}
        >
            <MjmlGroup width={theme.mailSize.contentWidth} cssClass="indented-section__group">
                {children}
            </MjmlGroup>
        </MjmlSection>
    );
};
