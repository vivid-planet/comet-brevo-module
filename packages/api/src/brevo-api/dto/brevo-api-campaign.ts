export interface BrevoApiCampaign {
    id: number;
    name: string;
    subject?: string;
    type: string;
    status: "draft" | "sent" | "archive" | "queued" | "suspended" | "in_process";
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
            estimatedViews: number;
            unsubscriptions: number;
            viewed: number;
        };
    };
    sentDate?: string;
    scheduledAt?: string;
}
