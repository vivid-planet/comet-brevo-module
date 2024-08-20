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
import { Add as AddIcon, Edit, Statistics, Visible } from "@comet/admin-icons";
import { BlockInterface } from "@comet/blocks-admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { isBefore } from "date-fns";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLDeleteEmailCampaignMutation,
    GQLDeleteEmailCampaignMutationVariables,
    GQLEmailCampaignsGridQuery,
    GQLEmailCampaignsGridQueryVariables,
    GQLEmailCampaignsListFragment,
} from "./EmailCampaignsGrid.generated";
import { SendingStateColumn } from "./SendingStateColumn";

const emailCampaignsFragment = gql`
    fragment EmailCampaignsList on EmailCampaign {
        id
        updatedAt
        createdAt
        title
        subject
        sendingState
        scheduledAt
        brevoId
        content
        targetGroups {
            id
            title
        }
    }
`;

const emailCampaignsQuery = gql`
    query EmailCampaignsGrid(
        $offset: Int
        $limit: Int
        $sort: [EmailCampaignSort!]
        $search: String
        $filter: EmailCampaignFilter
        $scope: EmailCampaignContentScopeInput!
    ) {
        emailCampaigns(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...EmailCampaignsList
            }
            totalCount
        }
    }
    ${emailCampaignsFragment}
`;

const deleteEmailCampaignMutation = gql`
    mutation DeleteEmailCampaign($id: ID!) {
        deleteEmailCampaign(id: $id)
    }
`;

const createEmailCampaignMutation = gql`
    mutation CreateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        createEmailCampaign(scope: $scope, input: $input) {
            id
        }
    }
`;

function EmailCampaignsGridToolbar() {
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
                    <FormattedMessage id="cometBrevoModule.emailCampaign.newEmailCampaign" defaultMessage="New email campaign" />
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
}

export function EmailCampaignsGrid({
    scope,
    EmailCampaignContentBlock,
}: {
    scope: ContentScopeInterface;
    EmailCampaignContentBlock: BlockInterface;
}): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "updatedAt", sort: "desc" }] }),
        ...usePersistentColumnState("EmailCampaignsGrid"),
    };

    const columns: GridColDef<GQLEmailCampaignsListFragment>[] = [
        {
            field: "updatedAt",
            headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.updatedAt", defaultMessage: "Updated At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
            filterable: false,
        },
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.createdAt", defaultMessage: "Created At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
            filterable: false,
        },
        { field: "title", headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.title", defaultMessage: "Title" }), flex: 2 },
        { field: "subject", headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.subject", defaultMessage: "Subject" }), flex: 1 },
        {
            field: "sendingState",
            headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.sendingState", defaultMessage: "Sending State" }),
            renderCell: ({ value }) => <SendingStateColumn sendingState={value} />,
            width: 150,
            filterable: false,
            sortable: false,
        },
        {
            field: "scheduledAt",
            headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.scheduledAt", defaultMessage: "Scheduled At" }),
            type: "dateTime",
            valueGetter: ({ value }) => (value ? new Date(value) : "-"),
            width: 200,
        },
        {
            field: "targetGroups",
            headerName: intl.formatMessage({ id: "cometBrevoModule.emailCampaign.targetGroups", defaultMessage: "Target groups" }),
            width: 150,
            renderCell: ({ value }) => value.map((value: { title: string }) => value.title).join(", "),
            filterable: false,
            sortable: false,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            align: "right",
            type: "actions",
            renderCell: ({ row }) => {
                const isScheduledDateInPast = row.scheduledAt != undefined && isBefore(new Date(row.scheduledAt), new Date());

                return (
                    <>
                        {row.sendingState !== "SENT" && !isScheduledDateInPast && (
                            <IconButton component={StackLink} pageName="edit" payload={row.id}>
                                <Edit color="primary" />
                            </IconButton>
                        )}
                        {row.sendingState === "SENT" && (
                            <IconButton component={StackLink} pageName="statistics" payload={row.id}>
                                <Statistics color="primary" />
                            </IconButton>
                        )}
                        {(row.sendingState === "SENT" || (row.sendingState == "SCHEDULED" && isScheduledDateInPast)) && (
                            <IconButton component={StackLink} pageName="view" payload={row.id}>
                                <Visible color="primary" />
                            </IconButton>
                        )}
                        <CrudContextMenu
                            copyData={() => {
                                return {
                                    title: row.title,
                                    subject: row.subject,
                                    content: EmailCampaignContentBlock.state2Output(EmailCampaignContentBlock.input2State(row.content)),
                                    targetGroups: row.targetGroups.map((targetGroup) => targetGroup.id),
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                                    mutation: createEmailCampaignMutation,
                                    variables: { scope, input: { ...input } },
                                });
                            }}
                            onDelete={
                                !row.brevoId
                                    ? async () => {
                                          await client.mutate<GQLDeleteEmailCampaignMutation, GQLDeleteEmailCampaignMutationVariables>({
                                              mutation: deleteEmailCampaignMutation,
                                              variables: { id: row.id },
                                          });
                                      }
                                    : undefined
                            }
                            refetchQueries={[emailCampaignsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLEmailCampaignsGridQuery, GQLEmailCampaignsGridQueryVariables>(emailCampaignsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.emailCampaigns.totalCount);
    if (error) throw error;
    const rows = data?.emailCampaigns.nodes ?? [];

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
                    Toolbar: EmailCampaignsGridToolbar,
                }}
            />
        </MainContent>
    );
}
