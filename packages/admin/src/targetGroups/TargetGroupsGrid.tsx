import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    GridFilterButton,
    MainContent,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackLink,
    Toolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarFillSpace,
    ToolbarItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Add as AddIcon, Edit } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    GQLCreateTargetGroupMutation,
    GQLCreateTargetGroupMutationVariables,
    GQLDeleteTargetGroupMutation,
    GQLDeleteTargetGroupMutationVariables,
    GQLTargetGroupsGridQuery,
    GQLTargetGroupsGridQueryVariables,
    GQLTargetGroupsListFragment,
} from "./TargetGroupsGrid.generated";

const targetGroupsFragment = gql`
    fragment TargetGroupsList on TargetGroup {
        id
        title
        totalSubscribers
        totalContactsBlocked
        isMainList
    }
`;

const targetGroupsQuery = gql`
    query TargetGroupsGrid(
        $offset: Int
        $limit: Int
        $sort: [TargetGroupSort!]
        $search: String
        $filter: TargetGroupFilter
        $scope: EmailCampaignContentScopeInput!
    ) {
        targetGroups(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...TargetGroupsList
            }
            totalCount
        }
    }
    ${targetGroupsFragment}
`;

const deleteTargetGroupMutation = gql`
    mutation DeleteTargetGroup($id: ID!) {
        deleteTargetGroup(id: $id)
    }
`;

const createTargetGroupMutation = gql`
    mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createTargetGroup(scope: $scope, input: $input) {
            id
        }
    }
`;

function TargetGroupsGridToolbar() {
    return (
        <Toolbar>
            <ToolbarAutomaticTitleItem />
            <ToolbarItem>
                <GridToolbarQuickFilter />
            </ToolbarItem>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
            <ToolbarFillSpace />
            <ToolbarActions>
                <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="contained" color="primary">
                    <FormattedMessage id="cometBrevoModule.targetGroup.newTargetGroup" defaultMessage="New target group" />
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
}

export function TargetGroupsGrid({ scope }: { scope: ContentScopeInterface }): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupsGrid") };

    const columns: GridColDef<GQLTargetGroupsListFragment>[] = [
        { field: "title", headerName: intl.formatMessage({ id: "cometBrevoModule.targetGroup.title", defaultMessage: "Title" }), flex: 1 },
        {
            field: "totalSubscribers",
            headerName: intl.formatMessage({ id: "cometBrevoModule.targetGroup.totalSubscribers", defaultMessage: "Total subscribers" }),
            type: "number",
            filterable: false,
            sortable: false,
            width: 200,
        },
        {
            field: "totalContactsBlocked",
            headerName: intl.formatMessage({ id: "cometBrevoModule.targetGroup.totalContactsBlocked", defaultMessage: "Total contacts blocked" }),
            type: "number",
            filterable: false,
            sortable: false,
            width: 200,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: ({ row }) => {
                if (row.isMainList) return;
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={row.id}>
                            <Edit color="primary" />
                        </IconButton>
                        <CrudContextMenu
                            copyData={() => {
                                return {
                                    title: row.title,
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                                    mutation: createTargetGroupMutation,
                                    variables: { scope, input },
                                });
                            }}
                            onDelete={async () => {
                                await client.mutate<GQLDeleteTargetGroupMutation, GQLDeleteTargetGroupMutationVariables>({
                                    mutation: deleteTargetGroupMutation,
                                    variables: { id: row.id },
                                });
                            }}
                            refetchQueries={[targetGroupsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLTargetGroupsGridQuery, GQLTargetGroupsGridQueryVariables>(targetGroupsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.targetGroups.totalCount);
    if (error) throw error;
    const rows = data?.targetGroups.nodes ?? [];

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                disableSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                components={{
                    Toolbar: TargetGroupsGridToolbar,
                }}
            />
        </MainContent>
    );
}
