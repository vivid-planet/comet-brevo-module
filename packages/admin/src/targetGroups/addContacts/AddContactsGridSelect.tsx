import { useMutation, useQuery } from "@apollo/client";
import {
    CancelButton,
    Field,
    FinalForm,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Add, Close, Remove, Save } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, Dialog, DialogActions, DialogTitle, IconButton, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { MemoryRouter } from "react-router";

import { targetGroupFormNamedOperations } from "../TargetGroupForm";
import {
    addBrevoContactsToTargetGroupMutation,
    assignedBrevoContactsQuery,
    removeBrevoContactFromTargetGroupMutation,
} from "./AddContactsGridSelect.gql";
import {
    GQLAddBrevoContactsToTargetGroupMutation,
    GQLAddBrevoContactsToTargetGroupMutationVariables,
    GQLBrevoContactsGridQuery,
    GQLBrevoContactsGridQueryVariables,
    GQLRemoveBrevoContactFromTargetGroupMutation,
    GQLRemoveBrevoContactFromTargetGroupMutationVariables,
    GQLTargetGroupBrevoContactsListFragment,
    namedOperations,
} from "./AddContactsGridSelect.gql.generated";

interface OpenSelectDialogToolbarProps {
    openDialog: () => void;
    intl: IntlShape;
}

const AssignedContactsGridToolbar = ({ openDialog, intl }: OpenSelectDialogToolbarProps) => {
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
            <ToolbarActions>
                <Button startIcon={<Add />} variant="contained" color="primary" onClick={openDialog}>
                    <FormattedMessage id="cometBrevoModule.targetGroup.assignedContacts.addContact" defaultMessage="Add contacts" />
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
};

const AssignableContactsGridToolbar = ({ intl }: OpenSelectDialogToolbarProps) => {
    return (
        <Toolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="cometBrevoModule.targetGroup.assignableContacts.title" defaultMessage="Assignable contacts" />
            </ToolbarTitleItem>
            <ToolbarItem>
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({
                        id: "cometBrevoModule.targetGroup.assignableContacts.searchEmail",
                        defaultMessage: "Search email address",
                    })}
                />
            </ToolbarItem>
        </Toolbar>
    );
};

interface FormProps {
    brevoContactIds: Array<number>;
}

const useSubmitMutation = (id: string) => {
    const [addContactsToTargetGroup] = useMutation<GQLAddBrevoContactsToTargetGroupMutation, GQLAddBrevoContactsToTargetGroupMutationVariables>(
        addBrevoContactsToTargetGroupMutation,
        {
            refetchQueries: [namedOperations.Query.BrevoContactsGrid, targetGroupFormNamedOperations.Query.TargetGroupForm],
        },
    );
    return ({ brevoContactIds }: FormProps) => {
        return addContactsToTargetGroup({
            variables: {
                id,
                input: {
                    brevoContactIds,
                },
            },
        });
    };
};

interface AddContactsGridSelectProps {
    scope: ContentScopeInterface;
    id: string;
    assignedContactsTargetGroupBrevoId?: number;
}

export function AddContactsGridSelect({ id, scope, assignedContactsTargetGroupBrevoId }: AddContactsGridSelectProps): React.ReactElement {
    const intl = useIntl();
    const submit = useSubmitMutation(id);
    const theme = useTheme();
    const dataGridAssignedContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignedBrevoContactsGrid") };
    const dataGridAssignableContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignableBrevoContactsGrid") };

    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

    const [removeContacts, { loading: removeLoading }] = useMutation<
        GQLRemoveBrevoContactFromTargetGroupMutation,
        GQLRemoveBrevoContactFromTargetGroupMutationVariables
    >(removeBrevoContactFromTargetGroupMutation, {
        refetchQueries: [namedOperations.Query.BrevoContactsGrid],
        awaitRefetchQueries: true,
    });

    const onDeleteClick = (contactId: number) => {
        if (!id) return;
        removeContacts({ variables: { id, input: { brevoContactId: contactId } } });
    };

    const {
        data: assignableContactsData,
        loading: assignableContactsLoading,
        error: assignableContactsError,
    } = useQuery<GQLBrevoContactsGridQuery, GQLBrevoContactsGridQueryVariables>(assignedBrevoContactsQuery, {
        variables: {
            offset: dataGridAssignableContactsProps.page * dataGridAssignableContactsProps.pageSize,
            limit: dataGridAssignableContactsProps.pageSize,
            email: dataGridAssignableContactsProps.filterModel?.quickFilterValues
                ? dataGridAssignableContactsProps.filterModel?.quickFilterValues[0]
                : undefined,
            onlyShowAssignedContactsOfTargetGroup: false,
            scope,
        },
    });

    const {
        data: assignedContactsData,
        loading: assignedContactsLoading,
        error: assignedContactsError,
    } = useQuery<GQLBrevoContactsGridQuery, GQLBrevoContactsGridQueryVariables>(assignedBrevoContactsQuery, {
        variables: {
            offset: dataGridAssignedContactsProps.page * dataGridAssignedContactsProps.pageSize,
            limit: dataGridAssignedContactsProps.pageSize,
            email: dataGridAssignedContactsProps.filterModel?.quickFilterValues
                ? dataGridAssignedContactsProps.filterModel?.quickFilterValues[0]
                : undefined,
            scope,
            targetGroupId: id,
            onlyShowAssignedContactsOfTargetGroup: true,
        },
        skip: !assignedContactsTargetGroupBrevoId,
    });

    const assignableContactsColumns: GridColDef<GQLTargetGroupBrevoContactsListFragment>[] = [
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

    const assignedContactsColumns = assignableContactsColumns.concat([
        {
            field: "actions",
            width: 50,
            disableColumnMenu: true,
            resizable: false,
            filterable: false,
            sortable: false,
            renderHeader: () => null,
            renderCell: ({ id }) => (
                <IconButton onClick={() => onDeleteClick(Number(id))} disabled={removeLoading}>
                    <Remove />
                </IconButton>
            ),
        },
    ]);

    const assignedContactsRowCount = useBufferedRowCount(assignedContactsData?.brevoContacts.totalCount);
    const assignableContactsRowCount = useBufferedRowCount(assignableContactsData?.brevoContacts.totalCount);

    if (assignedContactsError || assignableContactsError) throw assignedContactsError ?? assignableContactsError;

    return (
        <>
            <DataGrid
                {...dataGridAssignedContactsProps}
                disableSelectionOnClick
                rows={assignedContactsData?.brevoContacts.nodes ?? []}
                rowCount={assignedContactsRowCount}
                columns={assignedContactsColumns}
                autoHeight
                loading={assignedContactsLoading}
                components={{
                    Toolbar: AssignedContactsGridToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        intl,
                        openDialog: () => setIsDialogOpen(true),
                    },
                }}
            />

            <FinalForm<FormProps> mode="edit" onSubmit={submit}>
                {({ handleSubmit, submitting }) => {
                    return (
                        <MemoryRouter>
                            <Dialog open={isDialogOpen} maxWidth="lg" onClose={() => setIsDialogOpen(false)}>
                                <DialogTitle display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <ToolbarFillSpace />
                                    <IconButton onClick={() => setIsDialogOpen(false)}>
                                        <Close htmlColor={theme.palette.common.white} />
                                    </IconButton>
                                </DialogTitle>
                                <Box>
                                    <Field name="brevoContactIds" fullWidth>
                                        {(props) => (
                                            <DataGrid
                                                {...dataGridAssignableContactsProps}
                                                rows={assignableContactsData?.brevoContacts.nodes ?? []}
                                                rowCount={assignableContactsRowCount}
                                                columns={assignableContactsColumns}
                                                autoHeight
                                                loading={assignableContactsLoading || submitting}
                                                components={{
                                                    Toolbar: AssignableContactsGridToolbar,
                                                }}
                                                componentsProps={{
                                                    toolbar: {
                                                        intl,
                                                    },
                                                }}
                                                selectionModel={props.value}
                                                onSelectionModelChange={(newSelectionModel) => {
                                                    props.input.onChange(newSelectionModel);
                                                }}
                                                checkboxSelection
                                                keepNonExistentRowsSelected
                                            />
                                        )}
                                    </Field>
                                </Box>
                                <DialogActions>
                                    <CancelButton onClick={() => setIsDialogOpen(false)} />
                                    <Button
                                        startIcon={<Save />}
                                        onClick={async () => {
                                            await handleSubmit();
                                            setIsDialogOpen(false);
                                        }}
                                        variant="contained"
                                        color="primary"
                                    >
                                        <FormattedMessage id="cometBrevoModule.targetGroup.addBrevoContacts.dialog.save" defaultMessage="Save" />
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </MemoryRouter>
                    );
                }}
            </FinalForm>
        </>
    );
}