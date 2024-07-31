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

export const allAssignedBrevoContactsGridQuery = gql`
    query AllAssignedBrevoContactsGrid($offset: Int, $limit: Int, $email: String, $targetGroupId: ID!) {
        assignedBrevoContacts(offset: $offset, limit: $limit, email: $email, targetGroupId: $targetGroupId) {
            nodes {
                ...TargetGroupBrevoContactsList
            }
            totalCount
        }
    }
    ${targetGroupBrevoContactsFragment}
`;
