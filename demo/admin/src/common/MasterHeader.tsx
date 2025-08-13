import { BuildEntry, ContentScopeControls, Header, UserHeaderItem } from "@comet/cms-admin";

export const MasterHeader: React.FC = () => {
    return (
        <Header>
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem />
        </Header>
    );
};
