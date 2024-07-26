/* eslint-disable @comet/no-private-sibling-import */
import { useQuery } from "@apollo/client";
import {
    Toolbar,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { manuallyAssignedBrevoContactsGridQuery } from "../addContacts/AddContactsGridSelect.gql";
import {
    GQLManuallyAssignedBrevoContactsGridQuery,
    GQLManuallyAssignedBrevoContactsGridQueryVariables,
    GQLTargetGroupBrevoContactsListFragment,
} from "../addContacts/AddContactsGridSelect.gql.generated";

const AssignedContactsGridToolbar = ({ onOpenDialog }: { onOpenDialog: () => void }) => {
    const intl = useIntl();

    return (
        <Toolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="cometBrevoModule.targetGroup.assignedContacts.title" defaultMessage="Assigned contacts" />
            </ToolbarTitleItem>
            <ToolbarItem>
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({
                        id: "cometBrevoModule.targetGroup.assignedContacts.searchEmail",
                        defaultMessage: "Search email address",
                    })}
                />
            </ToolbarItem>
            <ToolbarFillSpace />
        </Toolbar>
    );
};

interface AllAssignedContactsGridProps {
    scope: ContentScopeInterface;
    id: string;
    assignedContactsTargetGroupBrevoId?: number;
}

export function AllAssignedContactsGrid({ id, scope, assignedContactsTargetGroupBrevoId }: AllAssignedContactsGridProps): React.ReactElement {
    const intl = useIntl();
    const dataGridAllAssignedContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignedBrevoContactsGrid") };

    const {
        data: allAssignedContactsData,
        loading: assignedContactsLoading,
        error: allAssignedContactsError,
    } = useQuery<GQLManuallyAssignedBrevoContactsGridQuery, GQLManuallyAssignedBrevoContactsGridQueryVariables>(
        manuallyAssignedBrevoContactsGridQuery,
        {
            variables: {
                offset: dataGridAllAssignedContactsProps.page * dataGridAllAssignedContactsProps.pageSize,
                limit: dataGridAllAssignedContactsProps.pageSize,
                email: dataGridAllAssignedContactsProps.filterModel?.quickFilterValues
                    ? dataGridAllAssignedContactsProps.filterModel?.quickFilterValues[0]
                    : undefined,
                targetGroupId: id,
            },
            skip: !assignedContactsTargetGroupBrevoId,
        },
    );

    const allAssignedContactsColumns: GridColDef<GQLTargetGroupBrevoContactsListFragment>[] = [
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
    ];

    const allAssignedContactsRowCount = useBufferedRowCount(allAssignedContactsData?.manuallyAssignedBrevoContacts.totalCount);

    if (allAssignedContactsError) throw allAssignedContactsError;

    return (
        <>
            <DataGrid
                {...dataGridAllAssignedContactsProps}
                disableSelectionOnClick
                rows={allAssignedContactsData?.manuallyAssignedBrevoContacts.nodes ?? []}
                rowCount={allAssignedContactsRowCount}
                columns={allAssignedContactsColumns}
                autoHeight
                loading={assignedContactsLoading}
                components={{
                    Toolbar: AssignedContactsGridToolbar,
                }}
            />
        </>
    );
}
