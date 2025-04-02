import { useApolloClient } from "@apollo/client";
import { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Alert, CheckboxField, FinalForm, Loading, messages, useErrorDialog } from "@comet/admin";
import { Upload } from "@comet/admin-icons";
import { useCurrentUser } from "@comet/cms-admin";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, styled } from "@mui/material";
import Button from "@mui/material/Button";
import saveAs from "file-saver";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FormattedMessage, useIntl } from "react-intl";

import { GQLCsvImportInformation, GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { CrudMoreActionsItem } from "../../temp/CrudMoreActionsMenu";
import { useBrevoConfig } from "../BrevoConfigProvider";
import { startBrevoContactImportMutation } from "./useContactImportFromCsv.gql";
import { GQLStartBrevoContactImportMutation, GQLStartBrevoContactImportMutationVariables } from "./useContactImportFromCsv.gql.generated";

interface UseContactImportProps {
    scope: GQLEmailCampaignContentScopeInput;
    sendDoubleOptIn: boolean;
    targetGroupId?: string;
    refetchQueries?: RefetchQueriesInclude;
}

type ContactImportFromCsvForm = {
    sendDoubleOptIn: boolean;
};

export const useContactImportFromCsv = ({ scope, targetGroupId, refetchQueries }: UseContactImportProps): [CrudMoreActionsItem, React.ReactNode] => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [sendDoubleOptIn, setSendDoubleOptIn] = React.useState(true);

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
            onClick: () => setOpen(true),
        }),
        [],
    );

    const handleClose = () => setOpen(false);

    const dialog = (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                <FormattedMessage id="cometBrevoModule.contactImport.title" defaultMessage="Importing contacts from CSV" />
            </DialogTitle>
            <DialogContent>
                <FinalForm<ContactImportFromCsvForm>
                    onSubmit={(values) => {
                        fileInputRef.current?.click();
                    }}
                    mode="add"
                    initialValues={{ sendDoubleOptIn: true }}
                >
                    {({ values }) => {
                        setSendDoubleOptIn(values.sendDoubleOptIn);

                        return (
                            <>
                                {values.sendDoubleOptIn ? (
                                    <Alert severity="warning" sx={{ marginBottom: 5 }}>
                                        <FormattedMessage
                                            id="cometBrevoModule.contactImport.contactAddAlert"
                                            defaultMessage="The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page."
                                        />
                                    </Alert>
                                ) : (
                                    <Alert severity="error" sx={{ marginBottom: 5 }}>
                                        <FormattedMessage
                                            id="cometBrevoModule.contactImport.contactNoOptInAlert"
                                            defaultMessage="No Double Opt-In email will be sent. Please ensure recipients have given their consent before proceeding."
                                        />
                                    </Alert>
                                )}
                                <CheckboxField
                                    name="sendDoubleOptIn"
                                    label={
                                        <FormattedMessage
                                            id="cometBrevoModule.contactImport.sendDoubleOptInMail"
                                            defaultMessage="Send double opt-in email"
                                        />
                                    }
                                    fullWidth
                                />
                            </>
                        );
                    }}
                </FinalForm>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    <FormattedMessage {...messages.cancel} />
                </Button>
                <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
                    <FormattedMessage id="cometBrevoModule.contactImport.importContacts" defaultMessage="Import Contacts" />
                </Button>
            </DialogActions>
        </Dialog>
    );

    const component = React.useMemo(
        () => (
            <ContactImportComponent
                scope={scope}
                targetGroupId={targetGroupId}
                fileInputRef={fileInputRef}
                sendDoubleOptIn={sendDoubleOptIn}
                refetchQueries={refetchQueries}
            />
        ),
        [refetchQueries, scope, targetGroupId, sendDoubleOptIn],
    );

    return [
        moreActionsMenuItem,
        <>
            {dialog}
            {component}
        </>,
    ];
};

interface ComponentProps extends UseContactImportProps {
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const ContactImportComponent = ({ scope, targetGroupId, fileInputRef, sendDoubleOptIn, refetchQueries }: ComponentProps) => {
    const apolloClient = useApolloClient();
    const [importingCsv, setImportingCsv] = React.useState(false);
    const [importInformation, setImportInformation] = React.useState<GQLCsvImportInformation | null>(null);
    const dialogOpen = importingCsv || !!importInformation;
    const errorDialog = useErrorDialog();
    const config = useBrevoConfig();
    const intl = useIntl();
    const client = useApolloClient();
    const currentUser = useCurrentUser();

    async function upload(file: File, scope: GQLEmailCampaignContentScopeInput, listIds?: string[]): Promise<GQLCsvImportInformation> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${config.apiUrl}/file-uploads/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(
                intl.formatMessage({ id: "cometBrevoModule.useContactImport.error.fileUpload", defaultMessage: "Could not upload file" }),
            );
        }

        const fileUploadId = (await response.json()).id;

        const { data } = await client.mutate<GQLStartBrevoContactImportMutation, GQLStartBrevoContactImportMutationVariables>({
            mutation: startBrevoContactImportMutation,
            variables: {
                fileId: fileUploadId,
                scope,
                sendDoubleOptIn,
                responsibleUserId: currentUser.id,
            },
        });

        if (!data) {
            throw new Error(
                intl.formatMessage({
                    id: "cometBrevoModule.useContactImport.error.defaultMessage",
                    defaultMessage:
                        "An error occured during the import. Please try again in a while or contact your administrator if the error persists.",
                }),
            );
        }
        return data.startBrevoContactImport;
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
            // Use Object.values to get the values of each column
            const row = Object.values(column); // No need to check for undefined/null

            // Join row values and remove the trailing semicolon if not needed
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
                const data = await upload(file, scope, targetGroupId ? [targetGroupId] : []);
                apolloClient.refetchQueries({ include: refetchQueries });

                if (data) {
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
                                                    <CsvDownloadLink onClick={saveErrorFile}>{chunks}</CsvDownloadLink>
                                                ),
                                            }}
                                        />
                                    </Alert>
                                </Box>
                            )}

                            {(importInformation.created > 0 || importInformation.updated > 0) && sendDoubleOptIn && (
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

const CsvDownloadLink = styled("span")`
    color: ${({ theme }) => theme.palette.info.main};
    text-decoration: underline;
    cursor: pointer;
`;
