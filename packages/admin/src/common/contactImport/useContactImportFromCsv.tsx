import { useApolloClient } from "@apollo/client";
import { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Alert, Loading, messages, useErrorDialog } from "@comet/admin";
import { Upload } from "@comet/admin-icons";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FormattedMessage } from "react-intl";

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

const ContactImportComponent = ({ scope, targetGroupId, fileInputRef, refetchQueries }: ComponentProps) => {
    const apolloClient = useApolloClient();
    const [importingCsv, setImportingCsv] = React.useState(false);
    const [importSuccessful, setImportSuccessful] = React.useState(false);
    const dialogOpen = importingCsv || importSuccessful;
    const errorDialog = useErrorDialog();
    const config = useBrevoConfig();

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

    const { getInputProps } = useDropzone({
        accept: { "text/csv": [] },
        multiple: false,
        onDrop: async (acceptedFiles: File[]) => {
            setImportingCsv(true);

            try {
                const file = acceptedFiles[0];
                const response = await upload(file, scope, targetGroupId ? [targetGroupId] : []);
                apolloClient.refetchQueries({ include: refetchQueries });

                if (response.ok) {
                    setImportingCsv(false);
                    setImportSuccessful(true);
                } else {
                    const errorResponse = await response.json();
                    throw new Error(JSON.stringify(errorResponse));
                }
            } catch (e) {
                setImportingCsv(false);

                let userMessage = (
                    <FormattedMessage
                        id="cometBrevoModule.useContactImport.error.defaultMessage"
                        defaultMessage="A error occured during the import. Please try again in a while or contact your administrator if the error persists."
                    />
                );
                if (e?.message && typeof e.message === "string" && e.message.includes("Too many contacts")) {
                    userMessage = (
                        <FormattedMessage
                            id="cometBrevoModule.useContactImport.error.tooManyContactsMessage"
                            defaultMessage="Too many contacts in file. Currently we only support 100 contacts at once."
                        />
                    );
                }

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
                    {importSuccessful && (
                        <FormattedMessage id="cometBrevoModule.useContactImport.importSuccessful.title" defaultMessage="Import successful" />
                    )}
                </DialogTitle>
                <DialogContent>
                    {importingCsv && <Loading />}
                    {importSuccessful && (
                        <>
                            <FormattedMessage
                                id="cometBrevoModule.useContactImport.importSuccessful.message"
                                defaultMessage="The contacts have been imported successfully"
                            />
                            <Box mt={2}>
                                <Alert severity="warning">
                                    <FormattedMessage
                                        id="cometBrevoModule.useContactImport.importSuccessful.doiNotice"
                                        defaultMessage="Contacts who have not yet confirmed their subscription will receive a double opt-in email to complete the process. These contacts will not appear in this list until they confirm their subscription. Once confirmed, they will automatically be added to the appropriate target group(s)."
                                    />
                                </Alert>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {importSuccessful && (
                        <Button onClick={() => setImportSuccessful(false)} variant="contained">
                            <FormattedMessage {...messages.ok} />
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};
