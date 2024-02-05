import { useMutation, useQuery } from "@apollo/client";
import { Field, FinalFormSelect, SaveButton } from "@comet/admin";
import { FinalFormDateTimePicker } from "@comet/admin-date-time";
import { Newsletter } from "@comet/admin-icons";
import { AdminComponentPaper, AdminComponentSectionGroup } from "@comet/blocks-admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Card, MenuItem } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { SendEmailCampaignNowDialog } from "./SendEmailCampaignNowDialog";
import { sendEmailCampaignNowMutation, targetGroupsSelectQuery } from "./SendManagerFields.gql";
import {
    GQLSendEmailCampaignNowMutation,
    GQLSendEmailCampaignNowMutationVariables,
    GQLTargetGroupsSelectQuery,
    GQLTargetGroupsSelectQueryVariables,
} from "./SendManagerFields.gql.generated";

interface SendManagerFieldsProps {
    disableScheduling?: boolean;
    scope: ContentScopeInterface;
    id?: string;
    isSendable: boolean;
}

const validateScheduledAt = (value: Date, now: Date) => {
    if (!value) return;

    if (value < now) {
        return (
            <FormattedMessage
                id="cometBrevoModule.emailCampaigns.sendManager.scheduledAt.validationError.pastDate"
                defaultMessage="Date must be in the future"
            />
        );
    }
};

export const SendManagerFields = ({ disableScheduling, scope, id, isSendable }: SendManagerFieldsProps) => {
    const [isSendEmailCampaignNowDialogOpen, setIsSendEmailCampaignNowDialogOpen] = React.useState(false);

    const { data: targetGroups } = useQuery<GQLTargetGroupsSelectQuery, GQLTargetGroupsSelectQueryVariables>(targetGroupsSelectQuery, {
        variables: { scope },
        fetchPolicy: "network-only",
    });

    const [sendEmailCampaignNow, { loading: sendEmailCampaignNowLoading, error: sendEmailCampaignNowError }] = useMutation<
        GQLSendEmailCampaignNowMutation,
        GQLSendEmailCampaignNowMutationVariables
    >(sendEmailCampaignNowMutation);

    const now = new Date();
    return (
        <Card>
            <AdminComponentPaper>
                <AdminComponentSectionGroup
                    title={<FormattedMessage id="cometBrevoModule.emailCampaigns.sendManager.title" defaultMessage="Send Manager" />}
                >
                    <Field
                        name="scheduledAt"
                        disabled={disableScheduling}
                        fullWidth
                        clearable
                        label={<FormattedMessage id="cometBrevoModule.emailCampaigns.scheduledAt" defaultMessage="Schedule date and time" />}
                        component={FinalFormDateTimePicker}
                        validate={(value) => validateScheduledAt(value, now)}
                        componentsProps={{ datePicker: { placeholder: "DD.MM.YYYY", minDate: now }, timePicker: { placeholder: "HH:mm" } }}
                    />
                    <Field
                        label={<FormattedMessage id="cometBrevoModule.emailCampaigns.targetGroup" defaultMessage="Target group" />}
                        name="targetGroup"
                        fullWidth
                    >
                        {(props) => (
                            <FinalFormSelect {...props} fullWidth clearable>
                                {targetGroups?.targetGroups.nodes.map((option) => (
                                    <MenuItem value={option.id} key={option.id}>
                                        {option.title}
                                    </MenuItem>
                                ))}
                            </FinalFormSelect>
                        )}
                    </Field>

                    <SaveButton
                        variant="contained"
                        disabled={!isSendable && id == undefined && disableScheduling}
                        saveIcon={<Newsletter />}
                        saving={sendEmailCampaignNowLoading}
                        hasErrors={!!sendEmailCampaignNowError}
                        savingItem={<FormattedMessage id="cometBrevoModule.emailCampaigns.sendNow.sendingText" defaultMessage="Sending..." />}
                        errorItem={
                            <FormattedMessage
                                id="cometBrevoModule.emailCampaigns.sendNow.errorText"
                                defaultMessage="There was an error sending the email campaign."
                            />
                        }
                        onClick={() => {
                            setIsSendEmailCampaignNowDialogOpen(true);
                        }}
                    >
                        <FormattedMessage id="cometBrevoModule.emailCampaigns.sendNow.sendText" defaultMessage="Send email campaign now" />
                    </SaveButton>
                    <SendEmailCampaignNowDialog
                        dialogOpen={isSendEmailCampaignNowDialogOpen}
                        handleNoClick={() => {
                            setIsSendEmailCampaignNowDialogOpen(false);
                        }}
                        handleYesClick={async () => {
                            if (id) {
                                await sendEmailCampaignNow({ variables: { id } });
                                setIsSendEmailCampaignNowDialogOpen(false);
                            }
                        }}
                    />
                </AdminComponentSectionGroup>
            </AdminComponentPaper>
        </Card>
    );
};
