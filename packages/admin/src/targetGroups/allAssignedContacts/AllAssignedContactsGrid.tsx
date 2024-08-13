import { useQuery } from "@apollo/client";
import {
    Alert,
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
    useErrorDialog,
    usePersistentColumnState,
    useSnackbarApi,
} from "@comet/admin";
import { Close, Save, Upload } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Box, Button, Dialog, DialogActions, DialogTitle, IconButton, Snackbar, Typography, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MemoryRouter } from "react-router";

import { CsvUploadField } from "../../common/form/CsvUploadField";
import { upload } from "../../common/upload";
import { allAssignedBrevoContactsGridQuery } from "./AllAssignedContactsGrid.gql";
import {
    GQLBrevoContactsQuery,
    GQLBrevoContactsQueryVariables,
    GQLTargetGroupBrevoContactsListFragment,
} from "./AllAssignedContactsGrid.gql.generated";

const AssignedContactsGridToolbar = ({ onOpenCsvImportDialog }: { onOpenCsvImportDialog: () => void }) => {
    const intl = useIntl();

    return (
        <Toolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="cometBrevoModule.targetGroup.assignedContacts.title" defaultMessage="All assigned contacts" />
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
                <Button startIcon={<Upload />} variant="contained" color="primary" onClick={onOpenCsvImportDialog}>
                    <FormattedMessage id="cometBrevoModule.targetGroup.assignedContacts.importCsvContacts" defaultMessage="Import contacts csv" />
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
};

interface AllAssignedContactsGridProps {
    scope: ContentScopeInterface;
    id: string;
    brevoId?: number;
}

interface FormData {
    csvUpload: File;
}

export function AllAssignedContactsGrid({ id, scope, brevoId }: AllAssignedContactsGridProps): React.ReactElement {
    const intl = useIntl();
    const dataGridAllAssignedContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignedBrevoContactsGrid") };
    const snackbarApi = useSnackbarApi();
    const errorDialog = useErrorDialog();
    const theme = useTheme();

    const [isCsvImportDialogOpen, setIsCsvImportDialogOpen] = React.useState<boolean>(false);

    const {
        data: allAssignedContactsData,
        loading: assignedContactsLoading,
        error: allAssignedContactsError,
        refetch: allAssignedContactsRefetch,
    } = useQuery<GQLBrevoContactsQuery, GQLBrevoContactsQueryVariables>(allAssignedBrevoContactsGridQuery, {
        variables: {
            offset: dataGridAllAssignedContactsProps.page * dataGridAllAssignedContactsProps.pageSize,
            limit: dataGridAllAssignedContactsProps.pageSize,
            email: dataGridAllAssignedContactsProps.filterModel?.quickFilterValues
                ? dataGridAllAssignedContactsProps.filterModel?.quickFilterValues[0]
                : undefined,
            targetGroupId: id,
            scope,
        },
        skip: !brevoId,
    });

    const submit = async (formData: FormData) => {
        const response = await upload(formData.csvUpload, scope, [id]);

        if (response.ok) {
            allAssignedContactsRefetch();
            setIsCsvImportDialogOpen(false);
            snackbarApi.showSnackbar(
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    key={Math.random()}
                    autoHideDuration={5000}
                    onClose={snackbarApi.hideSnackbar}
                >
                    <Alert onClose={snackbarApi.hideSnackbar} severity="success">
                        <FormattedMessage id="brevoContacts.importSuccess" defaultMessage="The contacts have been imported successfully" />
                    </Alert>
                </Snackbar>,
            );
        } else {
            const errorResponse = await response.json();

            errorDialog?.showError({
                title: <FormattedMessage id="common.error.serverError" defaultMessage="Server error" />,
                userMessage: (
                    <FormattedMessage
                        id="common.error.defaultMessage"
                        defaultMessage="A server error occured. Please try again in a while or contact your administrator if the error persists."
                    />
                ),
                error: JSON.stringify(errorResponse),
            });
        }
    };

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

    const allAssignedContactsRowCount = useBufferedRowCount(allAssignedContactsData?.brevoContacts.totalCount);

    if (allAssignedContactsError) throw allAssignedContactsError;

    return (
        <>
            <DataGrid
                {...dataGridAllAssignedContactsProps}
                disableSelectionOnClick
                rows={allAssignedContactsData?.brevoContacts.nodes ?? []}
                rowCount={allAssignedContactsRowCount}
                columns={allAssignedContactsColumns}
                autoHeight
                loading={assignedContactsLoading}
                components={{
                    Toolbar: AssignedContactsGridToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        onOpenCsvImportDialog: () => setIsCsvImportDialogOpen(true),
                    },
                }}
            />
            <FinalForm<FormData> mode="edit" onSubmit={submit}>
                {({ handleSubmit, submitting }) => {
                    return (
                        <MemoryRouter>
                            <Dialog open={isCsvImportDialogOpen} maxWidth="lg" onClose={() => setIsCsvImportDialogOpen(false)}>
                                <DialogTitle display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <Typography fontWeight={theme.typography.fontWeightMedium}>
                                        <FormattedMessage id="contacts.importBrevoContactCsv" defaultMessage="Import brevo contacts csv" />
                                    </Typography>
                                    <ToolbarFillSpace />
                                    <IconButton onClick={() => setIsCsvImportDialogOpen(false)}>
                                        <Close htmlColor={theme.palette.common.white} />
                                    </IconButton>
                                </DialogTitle>
                                <Box>
                                    <Field
                                        name="csvUpload"
                                        fullWidth
                                        required
                                        component={CsvUploadField}
                                        submitting={submitting}
                                        buttonText={<FormattedMessage id="contacts.selectCsv" defaultMessage="Select CSV" />}
                                    />
                                </Box>
                                <DialogActions>
                                    <CancelButton onClick={() => setIsCsvImportDialogOpen(false)} />
                                    <Button
                                        startIcon={<Save />}
                                        onClick={async () => {
                                            await handleSubmit();
                                            setIsCsvImportDialogOpen(false);
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
