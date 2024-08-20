import { gql } from "@apollo/client";

export const emailCampaignFormFragment = gql`
    fragment EmailCampaignForm on EmailCampaign {
        title
        subject
        scheduledAt
        content
        sendingState
        targetGroups {
            id
            title
        }
    }
`;

export const emailCampaignFormQuery = gql`
    query EmailCampaignForm($id: ID!) {
        emailCampaign(id: $id) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;

export const emailCampaignFormCheckForChangesQuery = gql`
    query EmailCampaignFormCheckForChanges($id: ID!) {
        emailCampaign(id: $id) {
            updatedAt
        }
    }
`;

export const createEmailCampaignMutation = gql`
    mutation CreateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        emailCampaign: createEmailCampaign(scope: $scope, input: $input) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;

export const updateEmailCampaignMutation = gql`
    mutation UpdateEmailCampaign($id: ID!, $input: EmailCampaignUpdateInput!, $lastUpdatedAt: DateTime) {
        emailCampaign: updateEmailCampaign(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;
