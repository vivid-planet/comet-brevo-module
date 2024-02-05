import { gql } from "@apollo/client";

export const SendEmailCampaignToTestEmailsMutation = gql`
    mutation SendEmailCampaignToTestEmails($id: ID!, $data: SendTestEmailCampaignArgs!) {
        sendEmailCampaignToTestEmails(id: $id, data: $data)
    }
`;
