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
    useEditDialog,
    usePersistentColumnState,
} from "@comet/admin";
import { Add as AddIcon, Download, Edit } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import saveAs from "file-saver";
import { DocumentNode } from "graphql";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { TargetGroupDialog } from "./TargetGroupDialog";
import {
    GQLCreateTargetGroupMutation,
    GQLCreateTargetGroupMutationVariables,
    GQLDeleteTargetGroupMutation,
    GQLDeleteTargetGroupMutationVariables,
    GQLTargetGroupContactItemFragment,
    GQLTargetGroupContactsQuery,
    GQLTargetGroupContactsQueryVariables,
    GQLTargetGroupsGridQuery,
    GQLTargetGroupsGridQueryVariables,
    GQLTargetGroupsListFragment,
} from "./TargetGroupsGrid.generated";

export type AdditionalContactAttributesType = Record<string, unknown>;

type ContactWithAdditionalAttributes = GQLTargetGroupContactItemFragment & AdditionalContactAttributesType;

const targetGroupsFragment = gql`
    fragment TargetGroupsList on TargetGroup {
        id
        title
        totalSubscribers
        totalContactsBlocked
        isMainList
    }
`;

const targetGroupContactItemFragment = gql`
    fragment TargetGroupContactItem on BrevoContact {
        id
        email
        emailBlacklisted
        smsBlacklisted
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

export function TargetGroupsGrid({
    scope,
    exportTargetGroupOptions,
}: {
    scope: ContentScopeInterface;
    exportTargetGroupOptions?: {
        additionalAttributesFragment: { name: string; fragment: DocumentNode };
        exportFields: { renderValue: (row: AdditionalContactAttributesType) => string; headerName: string }[];
    };
}): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupsGrid") };
    const [EditDialog, , editDialogApi] = useEditDialog();

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
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            editDialogApi.openAddDialog();
                        }}
                    >
                        <FormattedMessage id="cometBrevoModule.targetGroup.newTargetGroup" defaultMessage="New target group" />
                    </Button>
                </ToolbarActions>
            </Toolbar>
        );
    }

    const targetGroupContactsQuery = gql`
        query TargetGroupContacts($targetGroupId: ID!, $offset: Int, $limit: Int, $scope: EmailCampaignContentScopeInput!) {
            brevoContacts(targetGroupId: $targetGroupId, offset: $offset, limit: $limit, scope: $scope) {               
                 nodes {
                    ...TargetGroupContactItem
                    ${
                        exportTargetGroupOptions?.additionalAttributesFragment
                            ? "...".concat(exportTargetGroupOptions.additionalAttributesFragment?.name)
                            : ""
                    }
                }
                totalCount
            }
        }
        ${targetGroupContactItemFragment}
        ${exportTargetGroupOptions?.additionalAttributesFragment?.fragment ?? ""}
    `;

    const convertToCsv = (data: ContactWithAdditionalAttributes[]) => {
        const header = [
            intl.formatMessage({ id: "cometBrevoModule.targetGroup.export.brevoId", defaultMessage: "Brevo ID" }),
            intl.formatMessage({ id: "cometBrevoModule.targetGroup.export.email", defaultMessage: "Email" }),
            intl.formatMessage({ id: "cometBrevoModule.targetGroup.export.emailBlacklisted", defaultMessage: "Email blacklisted" }),
            intl.formatMessage({ id: "cometBrevoModule.targetGroup.export.smsBlacklisted", defaultMessage: "Sms blacklisted" }),
        ].concat(exportTargetGroupOptions?.exportFields.map((field) => field?.headerName ?? "") ?? []);

        const csvData = data.map((contact) => [
            `="${contact.id}"`,
            contact.email,
            contact.emailBlacklisted,
            contact.smsBlacklisted,
            exportTargetGroupOptions?.exportFields.map((field) => field.renderValue(contact)),
        ]);

        csvData.unshift(header);

        return csvData.map((row) => row.join(",")).join("\n");
    };

    async function downloadTargetGroupContactsExportFile({ id, title }: { id: string; title: string }) {
        let offset = 0;
        let shouldContinue = true;
        let allContacts: ContactWithAdditionalAttributes[] = [];

        while (shouldContinue) {
            const { data: newContactsData } = await client.query<GQLTargetGroupContactsQuery, GQLTargetGroupContactsQueryVariables>({
                query: targetGroupContactsQuery,
                variables: {
                    targetGroupId: id,
                    offset: offset,
                    limit: 100,
                    scope,
                },
            });

            allContacts = allContacts.concat(newContactsData.brevoContacts.nodes as ContactWithAdditionalAttributes[]);
            shouldContinue = allContacts.length < newContactsData.brevoContacts.totalCount;
            offset += 100;
        }

        const csvData = convertToCsv(allContacts);

        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${title}.csv`);
    }

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
                        <IconButton onClick={() => downloadTargetGroupContactsExportFile({ id: row.id, title: row.title })}>
                            <Download color="primary" />
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

    const { search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLTargetGroupsGridQuery, GQLTargetGroupsGridQueryVariables>(targetGroupsQuery, {
        variables: {
            scope,
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
            <EditDialog disableCloseAfterSave componentsProps={{ dialog: { maxWidth: "sm" } }}>
                <TargetGroupDialog scope={scope} />
            </EditDialog>
        </MainContent>
    );
}
