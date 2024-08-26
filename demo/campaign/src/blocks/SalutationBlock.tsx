import { PropsWithData } from "@comet/cms-site";
import { MjmlColumn, MjmlText } from "@luma-team/mjml-react";
import { RichTextBlockData } from "@src/blocks.generated";
import { IndentedSectionGroup } from "@src/components/IndentedSectionGroup";
import * as React from "react";
import { FormattedMessage } from "react-intl";

export const SalutationBlock: React.FC<PropsWithData<RichTextBlockData>> = ({ data }) => {
    return (
        <IndentedSectionGroup>
            <MjmlColumn>
                <MjmlText>
                    <FormattedMessage id="salutationBlock.salutation" defaultMessage="Dear customer!" />
                </MjmlText>
            </MjmlColumn>
        </IndentedSectionGroup>
    );
};
