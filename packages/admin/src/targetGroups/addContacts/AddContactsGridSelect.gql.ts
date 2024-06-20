import { gql } from "@apollo/client";

const targetGroupBrevoContactsFragment = gql`
    fragment TargetGroupBrevoContactsList on BrevoContact {
        id
        createdAt
        modifiedAt
        email
        emailBlacklisted
        smsBlacklisted
    }
`;

export const assignedBrevoContactsQuery = gql`
    query AssignedBrevoContactsGrid($offset: Int, $limit: Int, $email: String, $targetGroupId: ID!, $onlyShowManuallyAssignedContacts: Boolean) {
        brevoContactsInTargetGroup(
            offset: $offset
            limit: $limit
            email: $email
            targetGroupId: $targetGroupId
            onlyShowManuallyAssignedContacts: $onlyShowManuallyAssignedContacts
        ) {
            nodes {
                ...TargetGroupBrevoContactsList
            }
            totalCount
        }
    }
    ${targetGroupBrevoContactsFragment}
`;

export const allBrevoContactsQuery = gql`
    query AllBrevoContactsGrid($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...TargetGroupBrevoContactsList
            }
            totalCount
        }
    }
    ${targetGroupBrevoContactsFragment}
`;

export const addBrevoContactsToTargetGroupMutation = gql`
    mutation AddBrevoContactsToTargetGroup($id: ID!, $input: AddBrevoContactsInput!) {
        addBrevoContactsToTargetGroup(id: $id, input: $input)
    }
`;

export const removeBrevoContactFromTargetGroupMutation = gql`
    mutation RemoveBrevoContactFromTargetGroup($id: ID!, $input: RemoveBrevoContactInput!) {
        removeBrevoContactFromTargetGroup(id: $id, input: $input)
    }
`;
