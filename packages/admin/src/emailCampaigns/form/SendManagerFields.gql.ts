import { gql } from "@apollo/client";

const targetGroupSelectFragment = gql`
    fragment TargetGroupSelect on TargetGroup {
        id
        title
    }
`;

export const targetGroupsSelectQuery = gql`
    query TargetGroupsSelect($scope: EmailCampaignContentScopeInput!) {
        targetGroups(scope: $scope, limit: 100) {
            nodes {
                ...TargetGroupSelect
            }
        }
    }

    ${targetGroupSelectFragment}
`;

export const sendEmailCampaignNowMutation = gql`
    mutation SendEmailCampaignNow($id: ID!) {
        sendEmailCampaignNow(id: $id)
    }
`;
