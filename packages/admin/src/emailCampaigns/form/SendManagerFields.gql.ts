import { gql } from "@apollo/client";

export const targetGroupsSelectQuery = gql`
    query TargetGroupsSelect($scope: EmailCampaignContentScopeInput!) {
        targetGroups(scope: $scope) {
            nodes {
                id
                title
            }
        }
    }
`;
