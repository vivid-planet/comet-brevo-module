import { MjmlGroup, MjmlSection, MjmlStyle } from "@luma-team/mjml-react";
import { css } from "@src/util/stylesHelper";
import { theme } from "@src/util/theme";
import { type ComponentProps, type ReactNode } from "react";

export interface IndentedSectionGroupProps extends ComponentProps<typeof MjmlSection> {
    children?: ReactNode;
    cssClass?: string;
}

export const indentedSectionGroupStyles = (
    <MjmlStyle>{css`
        @media (max-width: ${theme.mailSize.contentWidth - 1}px) {
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
            cssClass={`indented-section ${cssClass || ""}`.trim()}
            paddingLeft={theme.mailSize.contentSpacing}
            paddingRight={theme.mailSize.contentSpacing}
            backgroundColor={theme.colors.background.content}
            {...restProps}
        >
            <MjmlGroup cssClass="indented-section__group">{children}</MjmlGroup>
        </MjmlSection>
    );
};
