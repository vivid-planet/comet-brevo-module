import { gql } from "@apollo/client";

export const emailCampaignViewQuery = gql`
    query EmailCampaignView($id: ID!) {
        emailCampaign(id: $id) {
            id
            content
        }
    }
`;
