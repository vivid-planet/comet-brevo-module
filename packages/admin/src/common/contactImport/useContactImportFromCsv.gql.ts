import { gql } from "@apollo/client";

export const startBrevoContactImportMutation = gql`
    mutation StartBrevoContactImport($scope: EmailCampaignContentScopeInput!, $fileId: ID!, $sendDoubleOptIn: Boolean!, $responsibleUserId: String!) {
        startBrevoContactImport(scope: $scope, fileId: $fileId, sendDoubleOptIn: $sendDoubleOptIn, responsibleUserId: $responsibleUserId) {
            created
            updated
            failed
            failedColumns
            errorMessage
        }
    }
`;
