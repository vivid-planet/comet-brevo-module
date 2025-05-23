import { gql } from "@apollo/client";
import { Loading, MainContent, RouterPrompt, RouterTab, RouterTabs, Toolbar, ToolbarFillSpace, ToolbarItem, useStackApi } from "@comet/admin";
import { ArrowLeft } from "@comet/admin-icons";
import { AdminComponentRoot } from "@comet/blocks-admin";
import { ContentScopeIndicator, createUsePage, PageName } from "@comet/cms-admin";
import { IconButton } from "@mui/material";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import * as React from "react";
import { useIntl } from "react-intl";

import { GQLEditLinkQuery, GQLEditLinkQueryVariables, GQLUpdateLinkMutation, GQLUpdateLinkMutationVariables } from "./EditLink.generated";

const usePage = createUsePage({
    rootBlocks: {
        content: LinkBlock,
    },
    pageType: "Link",
})<GQLEditLinkQuery, GQLEditLinkQueryVariables, GQLUpdateLinkMutation["saveLink"], GQLUpdateLinkMutationVariables>({
    getQuery: gql`
        query EditLink($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                name
                slug
                parentId
                document {
                    ... on DocumentInterface {
                        id
                        updatedAt
                    }
                    __typename
                    ... on Link {
                        content
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdateLink($pageId: ID!, $input: LinkInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID) {
            saveLink(linkId: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                content
                updatedAt
            }
        }
    `,
});

interface Props {
    id: string;
}

export const EditLink: React.FC<Props> = ({ id }) => {
    const intl = useIntl();
    const stackApi = useStackApi();

    const {
        pageState: linkState,
        rootBlocksApi,
        hasChanges,
        loading,
        dialogs,
        pageSaveButton,
        handleSavePage,
    } = usePage({
        pageId: id,
    });

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    if (!linkState) return null;

    return (
        <>
            {hasChanges && (
                <RouterPrompt
                    message={(location) => {
                        return intl.formatMessage({
                            id: "editPage.discardChanges",
                            defaultMessage: "Discard unsaved changes?",
                        });
                    }}
                    saveAction={async () => {
                        try {
                            await handleSavePage();
                            return true;
                        } catch {
                            return false;
                        }
                    }}
                />
            )}
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack} size="large">
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <PageName pageId={id} />
                <ToolbarFillSpace />
                <ToolbarItem>{pageSaveButton}</ToolbarItem>
            </Toolbar>
            <MainContent>
                <RouterTabs>
                    <RouterTab label={intl.formatMessage({ id: "generic.content", defaultMessage: "Content" })} path="">
                        <AdminComponentRoot>{rootBlocksApi.content.adminUI}</AdminComponentRoot>
                    </RouterTab>
                </RouterTabs>
            </MainContent>
            {dialogs}
        </>
    );
};
