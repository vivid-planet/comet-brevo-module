import { gql } from "@apollo/client";

export const startBrevoContactImportMutation = gql`
    mutation StartBrevoContactImport($scope: EmailCampaignContentScopeInput!, $fileId: ID!) {
        startBrevoContactImport(scope: $scope, fileId: $fileId) {
            created
            updated
            failed
            failedColumns
            errorMessage
        }
    }
`;
