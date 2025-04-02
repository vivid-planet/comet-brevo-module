import { gql } from "@apollo/client";

export const startBrevoContactImportMutation = gql`
    mutation StartBrevoContactImport($scope: EmailCampaignContentScopeInput!, $fileId: ID!, $sendDoubleOptIn: Boolean!) {
        startBrevoContactImport(scope: $scope, fileId: $fileId, sendDoubleOptIn: $sendDoubleOptIn) {
            created
            updated
            failed
            failedColumns
            errorMessage
        }
    }
`;
