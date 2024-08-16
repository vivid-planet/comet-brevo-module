import { PropsWithData } from "@comet/cms-site";
import { MjmlColumn } from "@luma-team/mjml-react";
import { RichTextBlockData } from "@src/blocks.generated";
import { IndentedSectionGroup } from "@src/components/IndentedSectionGroup";
import { RichText } from "@src/components/RichText";
import { theme } from "@src/util/theme";
import * as React from "react";

export const RichTextBlock: React.FC<PropsWithData<RichTextBlockData>> = ({ data }) => {
    return (
        <IndentedSectionGroup paddingLeft={theme.mailSize.contentSpacing} paddingRight={theme.mailSize.contentSpacing}>
            <MjmlColumn>
                <RichText data={data} />
            </MjmlColumn>
        </IndentedSectionGroup>
    );
};
