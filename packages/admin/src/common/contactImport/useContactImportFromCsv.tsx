import { useApolloClient } from "@apollo/client";
import { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Loading, messages } from "@comet/admin";
import { Upload } from "@comet/admin-icons";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import * as React from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { FormattedMessage } from "react-intl";

import { GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { CrudMoreActionsItem } from "../../temp/CrudMoreActionsMenu";
import { upload } from "../upload";

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
    const [error, setError] = React.useState(false);
    const dialogOpen = importingCsv || error;

    const { getInputProps } = useDropzone({
        accept: { "text/csv": [] },
        multiple: false,
        onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setImportingCsv(true);

            const file = acceptedFiles[0];

            try {
                await upload(file, scope, targetGroupId ? [targetGroupId] : []);
                await apolloClient.refetchQueries({ include: refetchQueries });
            } catch (e) {
                setError(true);
                return;
            } finally {
                setImportingCsv(false);
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
                    {error && <FormattedMessage {...messages.error} />}
                </DialogTitle>
                <DialogContent>
                    {importingCsv && <Loading />}

                    {error && (
                        <FormattedMessage
                            id="cometBrevoModule.useContactImport.error.text"
                            defaultMessage="An unexpected error occurred while importing your CSV file. Have you checked if it's formatted correctly?"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    {error && (
                        <Button
                            onClick={() => {
                                setError(false);
                            }}
                        >
                            <FormattedMessage {...messages.ok} />
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};
