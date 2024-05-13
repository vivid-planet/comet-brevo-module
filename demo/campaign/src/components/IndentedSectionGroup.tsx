import { MjmlGroup, MjmlSection } from "@luma-team/mjml-react";
import { theme } from "@src/util/theme";
import * as React from "react";

export interface IndentedSectionGroupProps extends React.ComponentProps<typeof MjmlSection> {
    children?: React.ReactNode;
    cssClass?: string;
}

const CONTENT_WIDTH = theme.mailSize.contentWidth - theme.mailSize.contentSpacing * 2;

export const IndentedSectionGroup = ({ children, cssClass, ...restProps }: IndentedSectionGroupProps) => {
    return (
        <MjmlSection
            cssClass={`${cssClass || ""}`.trim()}
            paddingLeft={theme.mailSize.contentSpacing}
            paddingRight={theme.mailSize.contentSpacing}
            backgroundColor={theme.colors.background.content}
            {...restProps}
        >
            <MjmlGroup width={CONTENT_WIDTH}>{children}</MjmlGroup>
        </MjmlSection>
    );
};
