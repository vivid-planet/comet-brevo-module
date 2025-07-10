import { useApolloClient, useMutation } from "@apollo/client";
import { Field, FinalFormSelect, SaveButton, Tooltip, useAsyncOptionsProps, useStackSwitchApi } from "@comet/admin";
import { FinalFormDateTimePicker } from "@comet/admin-date-time";
import { Info, Newsletter } from "@comet/admin-icons";
import { AdminComponentPaper, AdminComponentSectionGroup } from "@comet/blocks-admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Card } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { SendEmailCampaignNowDialog } from "./SendEmailCampaignNowDialog";
import { sendEmailCampaignNowMutation, targetGroupsSelectQuery } from "./SendManagerFields.gql";
import {
    GQLSendEmailCampaignNowMutation,
    GQLSendEmailCampaignNowMutationVariables,
    GQLTargetGroupSelectFragment,
    GQLTargetGroupsSelectQuery,
    GQLTargetGroupsSelectQueryVariables,
} from "./SendManagerFields.gql.generated";

interface SendManagerFieldsProps {
    scope: ContentScopeInterface;
    id?: string;
    isSendable: boolean;
    isCampaignCreated?: boolean;
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

export const SendManagerFields = ({ isCampaignCreated, scope, id, isSendable }: SendManagerFieldsProps) => {
    const stackSwitchApi = useStackSwitchApi();
    const apolloClient = useApolloClient();

    const [isSendEmailCampaignNowDialogOpen, setIsSendEmailCampaignNowDialogOpen] = React.useState(false);

    const selectAsyncMultipleProps = useAsyncOptionsProps(async () => {
        return (
            await apolloClient.query<GQLTargetGroupsSelectQuery, GQLTargetGroupsSelectQueryVariables>({
                query: targetGroupsSelectQuery,
                variables: { scope },
                fetchPolicy: "network-only",
            })
        ).data.targetGroups.nodes;
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
                        component={FinalFormSelect}
                        getOptionLabel={(option: GQLTargetGroupSelectFragment) => option.title}
                        getOptionSelected={(option: GQLTargetGroupSelectFragment, value: string) => {
                            return option.id === value;
                        }}
                        {...selectAsyncMultipleProps}
                        name="targetGroups"
                        label={<FormattedMessage id="cometBrevoModule.emailCampaigns.targetGroups" defaultMessage="Target groups" />}
                        multiple
                        fullWidth
                    />
                    <Field
                        name="scheduledAt"
                        disabled={isCampaignCreated}
                        fullWidth
                        clearable
                        label={
                            <>
                                <FormattedMessage id="cometBrevoModule.emailCampaigns.scheduledAt" defaultMessage="Schedule date and time" />{" "}
                                {isCampaignCreated && (
                                    <Tooltip
                                        title={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.scheduledAt.info"
                                                defaultMessage="Please select a target group and save the campaign before scheduling."
                                            />
                                        }
                                    >
                                        <Info />
                                    </Tooltip>
                                )}
                            </>
                        }
                        component={FinalFormDateTimePicker}
                        validate={(value) => (isCampaignCreated ? undefined : validateScheduledAt(value, now))}
                        componentsProps={{
                            datePicker: { placeholder: "DD.MM.YYYY", minDate: now },
                            timePicker: { placeholder: "HH:mm" },
                        }}
                    />

                    <SaveButton
                        variant="contained"
                        disabled={!isSendable || isCampaignCreated}
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
                                stackSwitchApi.activatePage(`grid`, "");
                            }
                        }}
                    />
                </AdminComponentSectionGroup>
            </AdminComponentPaper>
        </Card>
    );
};
