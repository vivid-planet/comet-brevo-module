import { gql } from "@apollo/client";

export const brevoContactFormFragment = gql`
        fragment BrevoContactForm on BrevoContact {
            
        }
        `;

export const brevoContactFormQuery = gql`
    query BrevoContactForm($id: ID!) {
        brevoContact(id: $id) {
            id
            updatedAt
            ...BrevoContactForm
        }
    }
    ${brevoContactFormFragment}
`;

export const brevoContactFormCheckForChangesQuery = gql`
    query BrevoContactFormCheckForChanges($id: ID!) {
        brevoContact(id: $id) {
            updatedAt
        }
    }
`;

export const createBrevoContactMutation = gql`
    mutation CreateBrevoContact($input: BrevoContactInput!) {
        createBrevoContact(input: $input) {
            id
            updatedAt
            ...BrevoContactForm
        }
    }
    ${brevoContactFormFragment}
`;

export const updateBrevoContactMutation = gql`
    mutation UpdateBrevoContact($id: ID!, $input: BrevoContactUpdateInput!, $lastUpdatedAt: DateTime) {
        updateBrevoContact(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...BrevoContactForm
        }
    }
    ${brevoContactFormFragment}
`;
