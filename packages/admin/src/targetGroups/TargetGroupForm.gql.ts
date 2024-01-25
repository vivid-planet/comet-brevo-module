import { gql } from "@apollo/client";

export const targetGroupFormFragment = gql`
    fragment TargetGroupForm on TargetGroup {
        title
    }
`;

export const targetGroupFormQuery = gql`
    query TargetGroupForm($id: ID!) {
        targetGroup(id: $id) {
            id
            updatedAt
            ...TargetGroupForm
        }
    }
    ${targetGroupFormFragment}
`;

export const targetGroupFormCheckForChangesQuery = gql`
    query TargetGroupFormCheckForChanges($id: ID!) {
        targetGroup(id: $id) {
            updatedAt
        }
    }
`;

export const createTargetGroupMutation = gql`
    mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createTargetGroup(scope: $scope, input: $input) {
            id
            updatedAt
            ...TargetGroupForm
        }
    }
    ${targetGroupFormFragment}
`;

export const updateTargetGroupMutation = gql`
    mutation UpdateTargetGroup($id: ID!, $input: TargetGroupUpdateInput!, $lastUpdatedAt: DateTime) {
        updateTargetGroup(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...TargetGroupForm
        }
    }
    ${targetGroupFormFragment}
`;
