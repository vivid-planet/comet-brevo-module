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
import { BlockPreviewContent } from "@comet/blocks-admin";
import { Button, IconButton } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { useContentScope } from "@src/common/ContentScopeProvider";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { EmailCampaignContentBlock } from "../blocks/EmailCampaignContentBlock";
import { EmailCampaignContentBlock } from "../emailCampaigns/blocks/EmailCampaignContentBlock";
import {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLDeleteEmailCampaignMutation,
    GQLDeleteEmailCampaignMutationVariables,
    GQLEmailCampaignsGridQuery,
    GQLEmailCampaignsGridQueryVariables,
    GQLEmailCampaignsListFragment,
} from "./EmailCampaignsGrid.generated";

const emailCampaignsFragment = gql`
    fragment EmailCampaignsList on EmailCampaign {
        id
        updatedAt
        createdAt
        title
        subject
        brevoId
        sendingState
        scheduledAt
        content
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
                    <FormattedMessage id="emailCampaign.newEmailCampaign" defaultMessage="New EmailCampaign" />
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
}

export function EmailCampaignsGrid(): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("EmailCampaignsGrid") };
    const { scope } = useContentScope();

    const columns: GridColDef<GQLEmailCampaignsListFragment>[] = [
        {
            field: "updatedAt",
            headerName: intl.formatMessage({ id: "emailCampaign.updatedAt", defaultMessage: "Updated At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "emailCampaign.createdAt", defaultMessage: "Created At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        { field: "title", headerName: intl.formatMessage({ id: "emailCampaign.title", defaultMessage: "Title" }), width: 150 },
        { field: "subject", headerName: intl.formatMessage({ id: "emailCampaign.subject", defaultMessage: "Subject" }), width: 150 },
        {
            field: "brevoId",
            headerName: intl.formatMessage({ id: "emailCampaign.brevoId", defaultMessage: "Brevo Id" }),
            type: "number",
            filterable: false,
            sortable: false,
            width: 150,
        },
        {
            field: "sendingState",
            headerName: intl.formatMessage({ id: "emailCampaign.sendingState", defaultMessage: "Sending State" }),
            type: "singleSelect",
            filterable: false,
            sortable: false,
            valueOptions: [
                { value: "DRAFT", label: intl.formatMessage({ id: "emailCampaign.sendingState.dRAFT", defaultMessage: "D R A F T" }) },
                { value: "SENT", label: intl.formatMessage({ id: "emailCampaign.sendingState.sENT", defaultMessage: "S E N T" }) },
                {
                    value: "SCHEDULED",
                    label: intl.formatMessage({ id: "emailCampaign.sendingState.sCHEDULED", defaultMessage: "S C H E D U L E D" }),
                },
            ],
            width: 150,
        },
        {
            field: "scheduledAt",
            headerName: intl.formatMessage({ id: "emailCampaign.scheduledAt", defaultMessage: "Scheduled At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        {
            field: "content",
            headerName: intl.formatMessage({ id: "emailCampaign.content", defaultMessage: "Content" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: (params) => {
                return <BlockPreviewContent block={EmailCampaignContentBlock} input={params.row.content} />;
            },
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: (params) => {
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={params.row.id}>
                            <Edit color="primary" />
                        </IconButton>
                        <CrudContextMenu
                            copyData={() => {
                                const row = params.row;
                                return {
                                    title: row.title,
                                    subject: row.subject,
                                    scheduledAt: row.scheduledAt,
                                    content: EmailCampaignContentBlock.state2Output(EmailCampaignContentBlock.input2State(row.content)),
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                                    mutation: createEmailCampaignMutation,
                                    variables: { scope, input },
                                });
                            }}
                            onDelete={async () => {
                                await client.mutate<GQLDeleteEmailCampaignMutation, GQLDeleteEmailCampaignMutationVariables>({
                                    mutation: deleteEmailCampaignMutation,
                                    variables: { id: params.row.id },
                                });
                            }}
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
        <MainContent fullHeight disablePadding>
            <DataGridPro
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
