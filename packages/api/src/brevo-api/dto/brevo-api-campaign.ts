import { GetEmailCampaignsCampaignsInner } from "@getbrevo/brevo";


export interface BrevoApiCampaign {
    id: number;
    name: string;
    subject?: string;
    type: GetEmailCampaignsCampaignsInner.TypeEnum;
    status:  GetEmailCampaignsCampaignsInner.StatusEnum;
    statistics: {
        globalStats: {
            uniqueClicks: number;
            clickers: number;
            complaints: number;
            delivered: number;
            sent: number;
            softBounces: number;
            hardBounces: number;
            uniqueViews: number;
            trackableViews: number;
            estimatedViews?: number;
            unsubscriptions: number;
            viewed: number;
        };
    };
    sentDate?: string;
    scheduledAt?: string;
}
