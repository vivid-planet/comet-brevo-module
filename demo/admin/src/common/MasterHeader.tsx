import { BuildEntry, ContentScopeControls, Header, UserHeaderItem } from "@comet/cms-admin";
import { type FC } from "react";

export const MasterHeader: FC = () => {
    return (
        <Header>
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem />
        </Header>
    );
};
