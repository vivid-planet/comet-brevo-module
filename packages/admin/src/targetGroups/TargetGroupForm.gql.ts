import { DocumentNode, gql } from "@apollo/client";

export const targetGroupFormQuery = (targetGroupFormFragment: DocumentNode) => gql`
    query TargetGroupForm($id: ID!) {
        targetGroup(id: $id) {
            id
            title
            updatedAt
            ...TargetGroupForm
            assignedContactsTargetGroup {
                id
            }
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

export const createTargetGroupMutation = (targetGroupFormFragment: DocumentNode) => gql`
    mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createTargetGroup(scope: $scope, input: $input) {
            id
            updatedAt
            ...TargetGroupForm
        }
    }
    ${targetGroupFormFragment}
`;

export const updateTargetGroupMutation = (targetGroupFormFragment: DocumentNode) => gql`
    mutation UpdateTargetGroup($id: ID!, $input: TargetGroupUpdateInput!, $lastUpdatedAt: DateTime) {
        updateTargetGroup(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...TargetGroupForm
        }
    }
    ${targetGroupFormFragment}
`;
