import { gql } from "@apollo/client";

export const startBrevoContactImportMutation = gql`
    mutation StartBrevoContactImport($scope: EmailCampaignContentScopeInput!, $fileId: ID!, $sendDoubleOptIn: Boolean!, $userId: String!) {
        startBrevoContactImport(scope: $scope, fileId: $fileId, sendDoubleOptIn: $sendDoubleOptIn, userId: $userId) {
            created
            updated
            failed
            failedColumns
            errorMessage
        }
    }
`;
