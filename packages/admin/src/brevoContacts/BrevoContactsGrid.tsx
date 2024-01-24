import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    MainContent,
    messages,
    RowActionsItem,
    RowActionsMenu,
    Toolbar,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Block, Check, Delete } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";

import {
    GQLBrevoContactsGridQuery,
    GQLBrevoContactsGridQueryVariables,
    GQLBrevoContactsListFragment,
    GQLDeleteBrevoContactMutation,
    GQLDeleteBrevoContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoContactsGrid.generated";

const brevoContactsFragment = gql`
    fragment BrevoContactsList on BrevoContact {
        id
        createdAt
        modifiedAt
        email
        emailBlacklisted
        smsBlacklisted
    }
`;

const brevoContactsQuery = gql`
    query BrevoContactsGrid($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoContactsList
            }
            totalCount
        }
    }
    ${brevoContactsFragment}
`;

const deleteBrevoContactMutation = gql`
    mutation DeleteBrevoContact($id: Int!) {
        deleteBrevoContact(id: $id)
    }
`;

const updateBrevoContactMutation = gql`
    mutation UpdateBrevoContact($id: Int!, $input: BrevoContactUpdateInput!) {
        updateBrevoContact(id: $id, input: $input) {
            id
        }
    }
`;

function BrevoContactsGridToolbar({ intl }: { intl: IntlShape }) {
    return (
        <Toolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="cometBrevoModule.brevoContact.title" defaultMessage="Contacts" />
            </ToolbarTitleItem>
            <ToolbarItem>
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({ id: "cometBrevoModule.brevoContact.searchEmail", defaultMessage: "Search email address" })}
                />
            </ToolbarItem>
            <ToolbarFillSpace />
        </Toolbar>
    );
}

export function BrevoContactsGrid({ scope }: { scope: ContentScopeInterface }): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("BrevoContactsGrid") };

    const columns: GridColDef<GQLBrevoContactsListFragment>[] = [
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "cometBrevoModule.brevoContact.subscribedAt", defaultMessage: "Subscribed At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.createdAt)),
        },
        {
            field: "modifiedAt",
            headerName: intl.formatMessage({ id: "cometBrevoModule.brevoContact.modifiedAt", defaultMessage: "Modified At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.modifiedAt)),
        },
        {
            field: "email",
            headerName: intl.formatMessage({ id: "cometBrevoModule.brevoContact.email", defaultMessage: "Email" }),
            filterable: false,
            sortable: false,
            width: 150,
            flex: 1,
        },
        {
            field: "emailBlacklisted",
            headerName: intl.formatMessage({ id: "cometBrevoModule.brevoContact.emailBlocked", defaultMessage: "Email blocked" }),
            type: "boolean",
            filterable: false,
            sortable: false,
            width: 150,
        },
        // TODO: add configurable contact attributes
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: (params) => {
                return (
                    <RowActionsMenu>
                        <RowActionsMenu>
                            <RowActionsItem
                                onClick={async () => {
                                    await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                                        mutation: updateBrevoContactMutation,
                                        variables: { id: params.row.id, input: { blocked: !params.row.emailBlacklisted } },
                                        refetchQueries: [brevoContactsQuery],
                                    });
                                }}
                                icon={params.row.emailBlacklisted ? <Check /> : <Block />}
                            >
                                {params.row.emailBlacklisted ? (
                                    <FormattedMessage id="cometBrevoModule.brevoContact.actions.unblock" defaultMessage="Unblock" />
                                ) : (
                                    <FormattedMessage id="cometBrevoModule.brevoContact.actions.block" defaultMessage="Block" />
                                )}
                            </RowActionsItem>

                            <RowActionsItem
                                onClick={async () => {
                                    await client.mutate<GQLDeleteBrevoContactMutation, GQLDeleteBrevoContactMutationVariables>({
                                        mutation: deleteBrevoContactMutation,
                                        variables: { id: params.row.id },
                                        refetchQueries: [brevoContactsQuery],
                                    });
                                }}
                                icon={<Delete />}
                            >
                                <FormattedMessage {...messages.delete} />
                            </RowActionsItem>
                        </RowActionsMenu>
                    </RowActionsMenu>
                );
            },
        },
    ];

    const { data, loading, error } = useQuery<GQLBrevoContactsGridQuery, GQLBrevoContactsGridQueryVariables>(brevoContactsQuery, {
        variables: {
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            email: dataGridProps.filterModel?.quickFilterValues ? dataGridProps.filterModel?.quickFilterValues[0] : undefined,
            scope,
        },
    });

    const rowCount = useBufferedRowCount(data?.brevoContacts.totalCount);
    if (error) throw error;
    const rows = data?.brevoContacts.nodes ?? [];

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
                    Toolbar: BrevoContactsGridToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        intl,
                    },
                }}
            />
        </MainContent>
    );
}
