import { MjmlColumn, MjmlDivider } from "@luma-team/mjml-react";
import { IndentedSectionGroup } from "@src/components/IndentedSectionGroup";

export const DividerBlock = () => {
    return (
        <IndentedSectionGroup>
            <MjmlColumn>
                <MjmlDivider />
            </MjmlColumn>
        </IndentedSectionGroup>
    );
};
