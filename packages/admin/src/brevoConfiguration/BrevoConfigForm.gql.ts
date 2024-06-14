import { gql } from "@apollo/client";

export const brevoConfigFormFragment = gql`
    fragment BrevoConfigForm on BrevoConfig {
        senderMail
        senderName
        isApiKeySet
        doiTemplateId
    }
`;

export const brevoConfigFormQuery = gql`
    query BrevoConfigForm($scope: EmailCampaignContentScopeInput!) {
        brevoConfig(scope: $scope) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const brevoConfigFormCheckForChangesQuery = gql`
    query BrevoConfigFormCheckForChanges($scope: EmailCampaignContentScopeInput!) {
        brevoConfig(scope: $scope) {
            updatedAt
        }
    }
`;

export const createBrevoConfigMutation = gql`
    mutation CreateBrevoConfig($scope: EmailCampaignContentScopeInput!, $input: BrevoConfigInput!) {
        createBrevoConfig(scope: $scope, input: $input) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const updateBrevoConfigMutation = gql`
    mutation UpdateBrevoConfig($id: ID!, $input: BrevoConfigUpdateInput!, $lastUpdatedAt: DateTime) {
        updateBrevoConfig(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const sendersSelectQuery = gql`
    query SendersSelect {
        senders {
            id
            name
            email
        }
    }
`;

export const doiTemplatesSelectQuery = gql`
    query DoiTemplatesSelect {
        doiTemplates {
            id
            name
        }
    }
`;
