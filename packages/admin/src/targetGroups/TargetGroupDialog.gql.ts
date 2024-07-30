import { gql } from "@apollo/client";

export const createTargetGroupMutation = gql`
    mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createTargetGroup(scope: $scope, input: $input) {
            id
        }
    }
`;
