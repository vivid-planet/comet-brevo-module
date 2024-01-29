import { gql } from "@apollo/client";

export const emailCampaignFormFragment = gql`
    fragment EmailCampaignForm on EmailCampaign {
        title
        subject
        scheduledAt
        content
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
        createEmailCampaign(scope: $scope, input: $input) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;

export const updateEmailCampaignMutation = gql`
    mutation UpdateEmailCampaign($id: ID!, $input: EmailCampaignUpdateInput!, $lastUpdatedAt: DateTime) {
        updateEmailCampaign(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;
