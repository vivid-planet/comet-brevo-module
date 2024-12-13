import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Field, FinalForm, FinalFormSelect, SaveButton } from "@comet/admin";
import { Newsletter } from "@comet/admin-icons";
import { AdminComponentPaper, AdminComponentSectionGroup } from "@comet/blocks-admin";
import { Card } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import { GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { GQLBrevoTestContactsSelectListFragment } from "./TestEmailCampaignForm.generated";
import { SendEmailCampaignToTestEmailsMutation } from "./TestEmailCampaignForm.gql";
import { GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables } from "./TestEmailCampaignForm.gql.generated";

interface FormProps {
    testEmails: string[];
}

interface TestEmailCampaignFormProps {
    id?: string;
    isSendable?: boolean;
    scope: GQLEmailCampaignContentScopeInput;
}

const brevoTestContactsSelectFragment = gql`
    fragment BrevoTestContactsSelectList on BrevoContact {
        id
        email
    }
`;

const brevoTestContactsSelectQuery = gql`
    query BrevoTestContactsGridSelect($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoTestContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoTestContactsSelectList
            }
            totalCount
        }
    }
    ${brevoTestContactsSelectFragment}
`;

export const TestEmailCampaignForm = ({ id, isSendable = false, scope }: TestEmailCampaignFormProps) => {
    const client = useApolloClient();

    const { data, loading, error } = useQuery(brevoTestContactsSelectQuery, {
        variables: { offset: 0, limit: 100, scope },
    });

    async function submitTestEmails({ testEmails }: FormProps) {
        if (id) {
            const { data } = await client.mutate<GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables>({
                mutation: SendEmailCampaignToTestEmailsMutation,
                variables: { id, data: { emails: testEmails } },
            });
            return data?.sendEmailCampaignToTestEmails;
        }
    }

    const emailOptions: string[] = data?.brevoTestContacts?.nodes?.map((contact: GQLBrevoTestContactsSelectListFragment) => contact.email) || [];

    return (
        <Card sx={{ mt: 4 }}>
            <AdminComponentPaper>
                <AdminComponentSectionGroup
                    title={
                        <FormattedMessage id="cometBrevoModule.emailCampaigns.testEmailCampaign.title" defaultMessage="Send test email campaign" />
                    }
                >
                    <FinalForm<FormProps> mode="edit" onSubmit={submitTestEmails} initialValues={{ testEmails: [] }}>
                        {({ handleSubmit, submitting, values }) => {
                            return (
                                <>
                                    <Field
                                        component={FinalFormSelect}
                                        name="testEmails"
                                        label={
                                            <FormattedMessage
                                                id="cometBrevoModule.emailCampaigns.testEmailCampaign.testEmails"
                                                defaultMessage="Email addresses"
                                            />
                                        }
                                        fullWidth
                                        options={emailOptions}
                                        isLoading={loading}
                                        error={!!error}
                                        value={values.testEmails || []}
                                        getOptionLabel={(option: string) => option}
                                    />
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
