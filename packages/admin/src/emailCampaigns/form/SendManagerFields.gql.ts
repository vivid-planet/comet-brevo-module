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

export const sendEmailCampaignNowMutation = gql`
    mutation SendEmailCampaignNow($id: ID!) {
        sendEmailCampaignNow(id: $id)
    }
`;
