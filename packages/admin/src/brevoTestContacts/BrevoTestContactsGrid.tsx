import { DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    MainContent,
    messages,
    RowActionsItem,
    RowActionsMenu,
    StackLink,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Add, Block, Check, Delete, Edit } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";

import { useContactImportFromCsv } from "../common/contactImport/useContactImportFromCsv";
import { GQLEmailCampaignContentScopeInput } from "../graphql.generated";
import { CrudMoreActionsMenu } from "../temp/CrudMoreActionsMenu";
import {
    GQLBrevoContactsListFragment,
    GQLDeleteBrevoContactMutation,
    GQLDeleteBrevoContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
    namedOperations,
} from "./BrevoContactsGrid.generated";
import { GQLBrevoTestContactsGridQuery, GQLBrevoTestContactsGridQueryVariables } from "./BrevoTestContactsGrid.generated";

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

const deleteBrevoContactMutation = gql`
    mutation DeleteBrevoContact($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        deleteBrevoContact(id: $id, scope: $scope)
    }
`;

const updateBrevoContactMutation = gql`
    mutation UpdateBrevoContact($id: Int!, $input: BrevoContactUpdateInput!, $scope: EmailCampaignContentScopeInput!) {
        updateBrevoContact(id: $id, input: $input, scope: $scope) {
            id
        }
    }
`;

function BrevoTestContactsGridToolbar({ intl, scope }: { intl: IntlShape; scope: GQLEmailCampaignContentScopeInput }) {
    const [moreActionsMenuItem, contactImportComponent] = useContactImportFromCsv({
        scope,
        refetchQueries: [namedOperations.Query.BrevoContactsGrid],
    });

    return (
        <>
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
                <ToolbarActions>
                    <CrudMoreActionsMenu overallItems={[moreActionsMenuItem]} />
                    <Button startIcon={<Add />} component={StackLink} pageName="add" payload="add" variant="contained" color="primary">
                        <FormattedMessage id="cometBrevoModule.brevoContact.newContact" defaultMessage="New contact" />
                    </Button>
                </ToolbarActions>
            </Toolbar>
            {contactImportComponent}
        </>
    );
}

export function BrevoTestContactsGrid({
    scope,
    additionalAttributesFragment,
    additionalGridFields = [],
}: {
    scope: ContentScopeInterface;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
}): React.ReactElement {
    const brevoTestContactsQuery = gql`
        query BrevoTestContactsGrid($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
            brevoTestContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
                nodes {
                    ...BrevoContactsList
                    ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment?.name) : ""}
                }
                totalCount
            }
        }
        ${brevoContactsFragment}
        ${additionalAttributesFragment?.fragment ?? ""}
    `;
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
        ...additionalGridFields,
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: (params) => {
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={params.row.id.toString()}>
                            <Edit color="primary" />
                        </IconButton>
                        <RowActionsMenu>
                            <RowActionsMenu>
                                <RowActionsItem
                                    onClick={async () => {
                                        await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                                            mutation: updateBrevoContactMutation,
                                            variables: { id: params.row.id, input: { blocked: !params.row.emailBlacklisted }, scope },
                                            refetchQueries: [brevoTestContactsQuery],
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
                                            variables: { id: params.row.id, scope },
                                            refetchQueries: [brevoTestContactsQuery],
                                        });
                                    }}
                                    icon={<Delete />}
                                >
                                    <FormattedMessage {...messages.delete} />
                                </RowActionsItem>
                            </RowActionsMenu>
                        </RowActionsMenu>
                    </>
                );
            },
        },
    ];

    const { data, loading, error } = useQuery<GQLBrevoTestContactsGridQuery, GQLBrevoTestContactsGridQueryVariables>(brevoTestContactsQuery, {
        variables: {
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            email: dataGridProps.filterModel?.quickFilterValues ? dataGridProps.filterModel?.quickFilterValues[0] : undefined,
            scope,
        },
    });

    const rowCount = useBufferedRowCount(data?.brevoTestContacts.totalCount);
    if (error) throw error;
    const rows = data?.brevoTestContacts.nodes ?? [];

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
                    Toolbar: BrevoTestContactsGridToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        intl,
                        scope,
                    },
                }}
            />
        </MainContent>
    );
}
