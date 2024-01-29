import { CrudGeneratorConfig } from "@comet/cms-admin";
export default [
    {
        target: "src/emailCampaigns/generated",
        entityName: "EmailCampaign",
        rootBlocks: {
            emailContentBlock: {
                name: "EmailCampaignContentBlock",
                import: "../emailCampaigns/blocks/EmailCampaignContentBlock",
            },
        },
    },
] satisfies CrudGeneratorConfig[];
