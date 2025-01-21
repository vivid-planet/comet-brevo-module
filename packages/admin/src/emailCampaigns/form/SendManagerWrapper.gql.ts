import { gql } from "@apollo/client";

export const brevoConfigQuery = gql`
    query BrevoConfig($scope: EmailCampaignContentScopeInput!) {
        brevoConfig(scope: $scope) {
            id
        }
    }
`;
