import { useApolloClient } from "@apollo/client";
import { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Alert, Loading, messages, useErrorDialog } from "@comet/admin";
import { Upload } from "@comet/admin-icons";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, styled } from "@mui/material";
import Button from "@mui/material/Button";
import saveAs from "file-saver";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FormattedMessage, useIntl } from "react-intl";

import { GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { CrudMoreActionsItem } from "../../temp/CrudMoreActionsMenu";
import { useBrevoConfig } from "../BrevoConfigProvider";

interface UseContactImportProps {
    scope: GQLEmailCampaignContentScopeInput;
    targetGroupId?: string;
    refetchQueries?: RefetchQueriesInclude;
}

export const useContactImportFromCsv = ({ scope, targetGroupId, refetchQueries }: UseContactImportProps): [CrudMoreActionsItem, React.ReactNode] => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const moreActionsMenuItem: CrudMoreActionsItem = React.useMemo(
        () => ({
            type: "action",
            label: (
                <FormattedMessage
                    id="cometBrevoModule.targetGroup.assignedContacts.actions.importFromCsv"
                    defaultMessage="Import contacts from CSV"
                />
            ),
            startAdornment: <Upload />,
            onClick: () => {
                fileInputRef.current?.click();
            },
        }),
        [],
    );

    const component = React.useMemo(
        () => <ContactImportComponent scope={scope} targetGroupId={targetGroupId} fileInputRef={fileInputRef} refetchQueries={refetchQueries} />,
        [refetchQueries, scope, targetGroupId],
    );

    return [moreActionsMenuItem, component];
};

interface ComponentProps extends UseContactImportProps {
    fileInputRef: React.RefObject<HTMLInputElement>;
}

interface ImportInformation {
    failed: number;
    created: number;
    updated: number;
    failedColumns: Record<string, string>[];
    errorMessage?: string;
}

const ContactImportComponent = ({ scope, targetGroupId, fileInputRef, refetchQueries }: ComponentProps) => {
    const apolloClient = useApolloClient();
    const [importingCsv, setImportingCsv] = React.useState(false);
    const [importInformation, setImportInformation] = React.useState<ImportInformation | null>(null);
    const dialogOpen = importingCsv || !!importInformation;
    const errorDialog = useErrorDialog();
    const config = useBrevoConfig();
    const intl = useIntl();

    function upload(file: File, scope: GQLEmailCampaignContentScopeInput, listIds?: string[]): Promise<Response> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("scope", JSON.stringify(scope));

        if (listIds) formData.append("listIds", JSON.stringify(listIds));

        return fetch(`${config.apiUrl}/brevo-contacts-csv/upload`, {
            method: "POST",
            body: formData,
        });
    }

    const saveErrorFile = () => {
        const failedColumns = importInformation?.failedColumns;
        if (!failedColumns || failedColumns.length === 0) {
            throw new Error(intl.formatMessage({ id: "export", defaultMessage: "No failed columns to save" }));
        }

        let errorData = "";

        // Add headers to the file without trailing semicolon
        const headers = Object.keys(failedColumns[0]);
        const headerStr = headers.join(";");
        errorData = `${headerStr.replace(/;+$/, "")}\n`; // Remove trailing semicolon from the header

        // Add each row of failed columns data
        for (const column of failedColumns) {
            const row = [];
            for (const key in column) {
                // If a value is undefined or null, treat it as an empty string
                row.push(column[key] !== undefined && column[key] !== null ? column[key] : "");
            }
            // Join row values, and explicitly retain empty fields but remove the final semicolon for non-empty rows
            const rowStr = row.join(";");
            errorData += `${rowStr.replace(/;+$/, "")}\n`;
        }

        // Create and download the file
        const file = new Blob([errorData], { type: "text/csv;charset=utf-8" });
        saveAs(file, `error-log-${new Date().toISOString()}.csv`);
    };

    const { getInputProps } = useDropzone({
        accept: { "text/csv": [] },
        multiple: false,
        onDrop: async (acceptedFiles: File[]) => {
            setImportingCsv(true);

            try {
                const file = acceptedFiles[0];
                const response = await upload(file, scope, targetGroupId ? [targetGroupId] : []);
                apolloClient.refetchQueries({ include: refetchQueries });

                const data = (await response.json()) as ImportInformation;

                if (response.ok) {
                    setImportingCsv(false);

                    if (data.errorMessage) {
                        errorDialog?.showError({
                            title: <FormattedMessage {...messages.error} />,
                            userMessage: data.errorMessage,
                            error: data.errorMessage,
                        });
                    } else {
                        setImportInformation(data);
                    }
                } else {
                    throw new Error(JSON.stringify(data));
                }
            } catch (e) {
                setImportingCsv(false);

                const userMessage = (
                    <FormattedMessage
                        id="cometBrevoModule.useContactImport.error.defaultMessage"
                        defaultMessage="An error occured during the import. Please try again in a while or contact your administrator if the error persists."
                    />
                );

                errorDialog?.showError({
                    title: <FormattedMessage {...messages.error} />,
                    userMessage,
                    error: String(e),
                });
            }
        },
    });

    return (
        <>
            <input type="file" hidden {...getInputProps()} ref={fileInputRef} />
            <Dialog open={dialogOpen}>
                <DialogTitle>
                    {importingCsv && (
                        <FormattedMessage id="cometBrevoModule.useContactImport.importing.title" defaultMessage="Importing contacts from CSV..." />
                    )}
                    {importInformation && (
                        <FormattedMessage id="cometBrevoModule.useContactImport.importSuccessful.title" defaultMessage="Import successful" />
                    )}
                </DialogTitle>
                <DialogContent>
                    {importingCsv && <Loading />}
                    {importInformation && (
                        <>
                            {importInformation.created > 0 && (
                                <FormattedMessage
                                    id="cometBrevoModule.useContactImport.importSuccessful.contactsImported"
                                    defaultMessage="{amount} contact(s) have been created successfully."
                                    values={{ amount: importInformation.created }}
                                />
                            )}
                            {importInformation.updated > 0 && (
                                <FormattedMessage
                                    id="cometBrevoModule.useContactImport.importSuccessful.contactsUpdated"
                                    defaultMessage="{amount} contact(s) have been updated."
                                    values={{ amount: importInformation.updated }}
                                />
                            )}

                            {importInformation.failed > 0 && (
                                <Box mt={2}>
                                    <Alert severity="error">
                                        <FormattedMessage
                                            id="cometBrevoModule.useContactImport.error.contactsCouldNotBeImported"
                                            defaultMessage="{amount} contact(s) could not be imported. <link>Download this file</link> to get the failing row(s)."
                                            values={{
                                                amount: importInformation.failed,
                                                link: (chunks: React.ReactNode) => (
                                                    <CSVDownloadLink onClick={saveErrorFile}>{chunks}</CSVDownloadLink>
                                                ),
                                            }}
                                        />
                                    </Alert>
                                </Box>
                            )}

                            {(importInformation.created > 0 || importInformation.updated > 0) && (
                                <Box mt={2}>
                                    <Alert severity="warning">
                                        <FormattedMessage
                                            id="cometBrevoModule.useContactImport.importSuccessful.doiNotice"
                                            defaultMessage="Contacts who have not yet confirmed their subscription will receive a double opt-in email to complete the process. These contacts will not appear in this list until they confirm their subscription. Once confirmed, they will automatically be added to the appropriate target group(s)."
                                        />
                                    </Alert>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {importInformation && (
                        <Button onClick={() => setImportInformation(null)} variant="contained">
                            <FormattedMessage {...messages.ok} />
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

const CSVDownloadLink = styled("span")`
    color: ${({ theme }) => theme.palette.info.main};
    text-decoration: underline;
    cursor: pointer;
`;
