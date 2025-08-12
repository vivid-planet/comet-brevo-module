import { Field, FinalFormInput, Tooltip } from "@comet/admin";
import { FormattedMessage } from "react-intl";
import { DialogContent } from "@mui/material";

export const ConfigFields = () => {
    return (
        <>
            <Field
                required
                fullWidth
                name="title"
                component={FinalFormInput}
                label={<FormattedMessage id="cometBrevoModule.emailCampaigns.title" defaultMessage="Title" />}
            />
            <Field
                required
                fullWidth
                name="subject"
                component={FinalFormInput}
                label={<FormattedMessage id="cometBrevoModule.emailCampaigns.subject" defaultMessage="Subject" />}
            />
        </>
    );
};
