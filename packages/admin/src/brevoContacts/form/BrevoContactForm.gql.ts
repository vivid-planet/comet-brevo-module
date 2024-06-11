import { DocumentNode, gql } from "@apollo/client";

export const brevoContactFormQuery = (brevoContactFormFragment: DocumentNode) => gql`
    query BrevoContactForm($id: Int!) {
        brevoContact(id: $id) {
            id
            modifiedAt
            ...BrevoContactForm
        }
    }
    ${brevoContactFormFragment}
`;

export const brevoContactFormCheckForChangesQuery = gql`
    query BrevoContactFormCheckForChanges($id: Int!) {
        brevoContact(id: $id) {
            modifiedAt
        }
    }
`;

export const createBrevoContactMutation = gql`
    mutation CreateBrevoContact($scope: EmailCampaignContentScopeInput!, $input: BrevoContactInput!) {
        createBrevoContact(scope: $scope, input: $input)
    }
`;

export const updateBrevoContactMutation = (brevoContactFormFragment: DocumentNode) => gql`
    mutation UpdateBrevoContact($id: Int!, $input: BrevoContactUpdateInput!) {
        updateBrevoContact(id: $id, input: $input) {
            id
            modifiedAt
            ...BrevoContactForm
        }
    }
    ${brevoContactFormFragment}
`;
