import { MjmlGroup, MjmlSection, MjmlStyle } from "@luma-team/mjml-react";
import { theme } from "@src/util/theme";
import * as React from "react";

export interface IndentedSectionGroupProps extends React.ComponentProps<typeof MjmlSection> {
    children?: React.ReactNode;
    cssClass?: string;
}

export const indentedSectionGroupStyles = (
    <MjmlStyle>{`
      @media (max-width: 759px) {
        .indented-section__group {
          width: 100% !important;
          max-width: 592px;
        }
      }
    `}</MjmlStyle>
);

const CONTENT_WIDTH = theme.mailSize.contentWidth - theme.mailSize.contentSpacing * 2;

export const IndentedSectionGroup = ({ children, cssClass, ...restProps }: IndentedSectionGroupProps) => {
    return (
        <MjmlSection
            cssClass={(`${cssClass || ""}`.trim(), "indented-section")}
            paddingLeft={theme.mailSize.contentSpacing}
            paddingRight={theme.mailSize.contentSpacing}
            backgroundColor={theme.colors.background.content}
            {...restProps}
        >
            <MjmlGroup width={CONTENT_WIDTH} cssClass="indented-section__group">
                {children}
            </MjmlGroup>
        </MjmlSection>
    );
};
