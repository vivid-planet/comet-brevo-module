import { DocumentNode, gql } from "@apollo/client";

export const targetGroupFormQuery = (targetGroupFormFragment?: DocumentNode) => {
    return gql`
        query TargetGroupForm($id: ID!) {
            targetGroup(id: $id) {
                id
                title
                updatedAt
                brevoId
                assignedContactsTargetGroupBrevoId
                ${targetGroupFormFragment ? "...TargetGroupForm" : ""}
            }
        }
        ${targetGroupFormFragment ?? ""}
    `;
};

export const targetGroupFormCheckForChangesQuery = gql`
    query TargetGroupFormCheckForChanges($id: ID!) {
        targetGroup(id: $id) {
            updatedAt
        }
    }
`;

export const createTargetGroupMutation = (targetGroupFormFragment?: DocumentNode) => {
    return gql`
        mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
            createTargetGroup(scope: $scope, input: $input) {
                id
                updatedAt
                ${targetGroupFormFragment ? "...TargetGroupForm" : ""}
            }
        }
        ${targetGroupFormFragment ?? ""}
    `;
};

export const updateTargetGroupMutation = (targetGroupFormFragment?: DocumentNode) => {
    return gql`
        mutation UpdateTargetGroup($id: ID!, $input: TargetGroupUpdateInput!, $lastUpdatedAt: DateTime) {
            updateTargetGroup(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
                id
                updatedAt
                ${targetGroupFormFragment ? "...TargetGroupForm" : ""}
            }
        }
        ${targetGroupFormFragment ?? ""}
    `;
};
