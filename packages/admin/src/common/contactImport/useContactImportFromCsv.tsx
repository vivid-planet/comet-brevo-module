import { useApolloClient } from "@apollo/client";
import { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Alert, Loading, messages, useErrorDialog, useSnackbarApi } from "@comet/admin";
import { Upload } from "@comet/admin-icons";
import { Dialog, DialogContent, DialogTitle, Snackbar } from "@mui/material";
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
    const snackbarApi = useSnackbarApi();
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

                    snackbarApi.showSnackbar(
                        <Snackbar
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
                    throw new Error(JSON.stringify(errorResponse));
                }
            } catch (e) {
                setImportingCsv(false);

                errorDialog?.showError({
                    title: <FormattedMessage {...messages.error} />,
                    userMessage: (
                        <FormattedMessage
                            id="cometBrevoModule.useContactImport.error.defaultMessage"
                            defaultMessage="A error occured during the import. Please try again in a while or contact your administrator if the error persists."
                        />
                    ),
                    error: String(e),
                });
            }
        },
    });

    return (
        <>
            <input type="file" hidden {...getInputProps()} ref={fileInputRef} />
            <Dialog open={importingCsv}>
                <DialogTitle>
                    {importingCsv && (
                        <FormattedMessage id="cometBrevoModule.useContactImport.importing.title" defaultMessage="Importing contacts from CSV..." />
                    )}
                </DialogTitle>
                <DialogContent>{importingCsv && <Loading />}</DialogContent>
            </Dialog>
        </>
    );
};
