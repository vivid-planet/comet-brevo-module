import { CancelButton, SaveButton } from "@comet/admin";
// TODO v8: remove eslint-disable-next-line
// eslint-disable-next-line no-restricted-imports
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FormattedMessage } from "react-intl";

interface SendEmailCampaignNowDialogProps {
    dialogOpen: boolean;
    handleNoClick: () => void;
    handleYesClick: () => void;
}

const SendEmailCampaignNowDialog = ({ dialogOpen, handleNoClick, handleYesClick }: SendEmailCampaignNowDialogProps) => {
    return (
        <Dialog open={dialogOpen} onClose={handleNoClick}>
            <DialogTitle>
                <FormattedMessage id="cometBrevoModule.emailCampaigns.sendNow.dialog.title" defaultMessage="Send email campaign now?" />
            </DialogTitle>
            <DialogContent>
                <FormattedMessage
                    id="cometBrevoModule.emailCampaigns.sendNow.dialog.contentText"
                    defaultMessage="Are you sure you want to send the email campaign now?"
                />
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleNoClick} />
                <SaveButton onClick={handleYesClick}>
                    <FormattedMessage id="cometBrevoModule.emailCampaigns.sendNow.dialog.sendText" defaultMessage="Send now" />
                </SaveButton>
            </DialogActions>
        </Dialog>
    );
};

export { SendEmailCampaignNowDialog };
