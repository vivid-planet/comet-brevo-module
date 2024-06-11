import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import { SendingState } from "../email-campaign/sending-state.enum";
import { BrevoApiCampaign } from "./dto/brevo-api-campaign";
import { BrevoApiCampaignStatistics } from "./dto/brevo-api-campaign-statistics";

@Injectable()
export class BrevoApiCampaignsService {
    private readonly campaignsApi: SibApiV3Sdk.EmailCampaignsApi;

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {
        this.campaignsApi = new SibApiV3Sdk.EmailCampaignsApi();
        this.campaignsApi.setApiKey(SibApiV3Sdk.EmailCampaignsApiApiKeys.apiKey, config.brevo.apiKey);
    }

    public getSendingInformationFromBrevoCampaign(campaign: BrevoApiCampaign): SendingState {
        if (campaign.status === "sent") {
            return SendingState.SENT;
        } else if (campaign.status === "queued" || campaign.status === "in_process") {
            return SendingState.SCHEDULED;
        }

        return SendingState.DRAFT;
    }

    public async createBrevoCampaign({
        campaign,
        htmlContent,
        sender,
        scheduledAt,
    }: {
        campaign: EmailCampaignInterface;
        htmlContent: string;
        sender: { name: string; mail: string };
        scheduledAt?: Date;
    }): Promise<number> {
        const targetGroup = await campaign.targetGroup?.load();

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, email: sender.mail },
            recipients: { listIds: targetGroup ? [targetGroup?.brevoId] : [] },
            htmlContent,
            scheduledAt: scheduledAt?.toISOString(),
        };

        const data = await this.campaignsApi.createEmailCampaign(emailCampaign);
        return data.body.id;
    }

    public async updateBrevoCampaign({
        id,
        campaign,
        htmlContent,
        scheduledAt,
        sender,
    }: {
        id: number;
        campaign: EmailCampaignInterface;
        htmlContent: string;
        sender: { name: string; mail: string };
        scheduledAt?: Date;
    }): Promise<boolean> {
        const targetGroup = await campaign.targetGroup?.load();

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, mail: sender.mail },
            recipients: { listIds: targetGroup ? [targetGroup?.brevoId] : [] },
            htmlContent,
            scheduledAt: scheduledAt?.toISOString(),
        };

        const result = await this.campaignsApi.updateEmailCampaign(id, emailCampaign);
        return result.response.statusCode === 204;
    }

    public async sendBrevoCampaign(id: number): Promise<boolean> {
        const result = await this.campaignsApi.sendEmailCampaignNow(id);
        return result.response.statusCode === 204;
    }

    public async updateBrevoCampaignStatus(id: number, updated_status: SibApiV3Sdk.UpdateCampaignStatus.StatusEnum): Promise<boolean> {
        const status = new SibApiV3Sdk.UpdateCampaignStatus();
        status.status = updated_status;
        const result = await this.campaignsApi.updateCampaignStatus(id, status);
        return result.response.statusCode === 204;
    }

    public async sendTestEmail(id: number, emails: string[]): Promise<boolean> {
        const result = await this.campaignsApi.sendTestEmail(id, { emailTo: emails });
        return result.response.statusCode === 204;
    }

    public async loadBrevoCampaignsByIds(ids: number[]): Promise<BrevoApiCampaign[]> {
        const campaigns = [];
        for await (const campaign of await this.getCampaignsResponse(ids)) {
            campaigns.push(campaign);
        }

        return campaigns;
    }

    public async loadBrevoCampaignById(id: number): Promise<BrevoApiCampaign> {
        const response = await this.campaignsApi.getEmailCampaign(id);

        // wrong type in brevo library -> needs to be cast to unknown first
        return response.body as unknown as BrevoApiCampaign;
    }

    public async loadBrevoCampaignStatisticsById(id: number): Promise<BrevoApiCampaignStatistics> {
        const campaign = await this.campaignsApi.getEmailCampaign(id);

        return campaign.body.statistics.campaignStats[0];
    }

    private async *getCampaignsResponse(
        ids: number[],
        status?: "suspended" | "archive" | "sent" | "queued" | "draft" | "inProcess",
    ): AsyncGenerator<BrevoApiCampaign, void, undefined> {
        let offset = 0;
        const limit = 100;

        while (true) {
            const campaignsResponse = await this.campaignsApi.getEmailCampaigns(undefined, status, undefined, undefined, undefined, limit, offset);
            const campaignArray = (campaignsResponse.body.campaigns ?? []).filter((item) => ids.includes(item.id));

            if (campaignArray.length === 0) {
                break;
            }
            yield* campaignArray;

            offset += limit;
        }
    }
}
