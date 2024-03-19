import { gql } from "@apollo/client";

export const emailCampaignStatistics = gql`
    query EmailCampaignStatistics($id: ID!) {
        emailCampaignStatistics(id: $id) {
            uniqueClicks
            unsubscriptions
            delivered
            sent
            softBounces
            hardBounces
            uniqueViews
        }
    }
`;
