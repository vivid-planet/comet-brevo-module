import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    MainContent,
    muiGridSortToGql,
    StackLink,
    Toolbar,
    ToolbarAutomaticTitleItem,
    ToolbarFillSpace,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Edit } from "@comet/admin-icons";
import { IconButton } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import * as React from "react";
import { useIntl } from "react-intl";

import {
    GQLBrevoContactsGridQuery,
    GQLBrevoContactsGridQueryVariables,
    GQLBrevoContactsListFragment,
    GQLDeleteBrevoContactMutation,
    GQLDeleteBrevoContactMutationVariables,
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
    query BrevoContactsGrid($offset: Int, $limit: Int) {
        brevoContacts(offset: $offset, limit: $limit) {
            nodes {
                ...BrevoContactsList
            }
            totalCount
        }
    }
    ${brevoContactsFragment}
`;

const deleteBrevoContactMutation = gql`
    mutation DeleteBrevoContact($id: ID!) {
        deleteBrevoContact(id: $id)
    }
`;

function BrevoContactsGridToolbar() {
    return (
        <Toolbar>
            <ToolbarAutomaticTitleItem />

            <ToolbarFillSpace />
        </Toolbar>
    );
}

export function BrevoContactsGrid(): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("BrevoContactsGrid") };

    const columns: GridColDef<GQLBrevoContactsListFragment>[] = [
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "brevoContact.createdAt", defaultMessage: "Created At" }),
            filterable: false,
            sortable: false,
            width: 150,
        },
        {
            field: "modifiedAt",
            headerName: intl.formatMessage({ id: "brevoContact.modifiedAt", defaultMessage: "Modified At" }),
            filterable: false,
            sortable: false,
            width: 150,
        },
        {
            field: "email",
            headerName: intl.formatMessage({ id: "brevoContact.email", defaultMessage: "Email" }),
            filterable: false,
            sortable: false,
            width: 150,
        },
        {
            field: "emailBlacklisted",
            headerName: intl.formatMessage({ id: "brevoContact.emailBlacklisted", defaultMessage: "Email Blacklisted" }),
            type: "boolean",
            filterable: false,
            sortable: false,
            width: 150,
        },
        {
            field: "smsBlacklisted",
            headerName: intl.formatMessage({ id: "brevoContact.smsBlacklisted", defaultMessage: "Sms Blacklisted" }),
            type: "boolean",
            filterable: false,
            sortable: false,
            width: 150,
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
                            onDelete={async () => {
                                await client.mutate<GQLDeleteBrevoContactMutation, GQLDeleteBrevoContactMutationVariables>({
                                    mutation: deleteBrevoContactMutation,
                                    variables: { id: params.row.id },
                                });
                            }}
                            refetchQueries={[brevoContactsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { data, loading, error } = useQuery<GQLBrevoContactsGridQuery, GQLBrevoContactsGridQueryVariables>(brevoContactsQuery, {
        variables: {
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.brevoContacts.totalCount);
    if (error) throw error;
    const rows = data?.brevoContacts.nodes ?? [];

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
                    Toolbar: BrevoContactsGridToolbar,
                }}
            />
        </MainContent>
    );
}
