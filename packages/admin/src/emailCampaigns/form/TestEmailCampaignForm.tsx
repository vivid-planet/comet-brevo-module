import { useApolloClient } from "@apollo/client";
import { EditDialogApiContext, Field, FinalForm, FinalFormInput, SaveButton, StackApiContext } from "@comet/admin";
import { Newsletter } from "@comet/admin-icons";
import { AdminComponentPaper, AdminComponentSectionGroup } from "@comet/blocks-admin";
import { Card, FormHelperText, Typography } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import { SendEmailCampaignToTestEmailsMutation } from "./TestEmailCampaignForm.gql";
import { GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables } from "./TestEmailCampaignForm.gql.generated";

interface FormProps {
    testEmails: string;
}

interface TestEmailCampaignFormProps {
    id?: string;
    isSendable?: boolean;
}

export const TestEmailCampaignForm = ({ id, isSendable = false }: TestEmailCampaignFormProps) => {
    const client = useApolloClient();
    const stackApi = React.useContext(StackApiContext);
    const editDialog = React.useContext(EditDialogApiContext);

    async function submitTestEmails({ testEmails }: FormProps) {
        const emailsArray = testEmails.trim().split("\n");

        if (id) {
            const { data } = await client.mutate<GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables>({
                mutation: SendEmailCampaignToTestEmailsMutation,
                variables: { id, data: { emails: emailsArray } },
            });
            return data?.sendEmailCampaignToTestEmails;
        }
    }

    return (
        <Card sx={{ mt: 4 }}>
            <AdminComponentPaper>
                <AdminComponentSectionGroup
                    title={
                        <FormattedMessage id="cometBrevoModule.emailCampaigns.testEmailCampaign.title" defaultMessage="Send test email campaign" />
                    }
                >
                    <FinalForm<FormProps>
                        mode="edit"
                        onSubmit={submitTestEmails}
                        onAfterSubmit={() => {
                            stackApi?.goBack();
                            editDialog?.closeDialog({ delay: true });
                        }}
                    >
                        {({ handleSubmit, submitting, values }) => {
                            return (
                                <>
                                    <Field
                                        name="testEmails"
                                        label={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.testEmails"
                                                defaultMessage="Email addresses"
                                            />
                                        }
                                        component={FinalFormInput}
                                        multiline
                                        placeholder={["First test email address", "Second test email address"].join("\n")}
                                        fullWidth
                                        minRows={4}
                                    />
                                    <FormHelperText sx={{ marginTop: -2, marginBottom: 4 }}>
                                        <Typography sx={{ display: "flex", alignItems: "center" }}>
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.oneEmailAddressEachLine"
                                                defaultMessage="One email address each line"
                                            />
                                        </Typography>
                                        <Typography />
                                    </FormHelperText>
                                    <SaveButton
                                        disabled={!values.testEmails || !isSendable || !id}
                                        saveIcon={<Newsletter />}
                                        onClick={handleSubmit}
                                        saving={submitting}
                                        errorItem={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.errorText"
                                                defaultMessage="There was an error sending the email campaign to the test addresses."
                                            />
                                        }
                                        successItem={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.successText"
                                                defaultMessage="Test email campaign was sent successfully."
                                            />
                                        }
                                        savingItem={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.sendingText"
                                                defaultMessage="Sending..."
                                            />
                                        }
                                    >
                                        <FormattedMessage
                                            id="cometBrevoModule.emailCampaigns.testEmailCampaign.sendText"
                                            defaultMessage="Send test email campaign"
                                        />
                                    </SaveButton>
                                </>
                            );
                        }}
                    </FinalForm>
                </AdminComponentSectionGroup>
            </AdminComponentPaper>
        </Card>
    );
};
