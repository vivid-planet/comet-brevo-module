import * as Brevo from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import { SendingState } from "../email-campaign/sending-state.enum";
import { BrevoApiCampaign } from "./dto/brevo-api-campaign";
import { BrevoApiCampaignStatistics } from "./dto/brevo-api-campaign-statistics";

@Injectable()
export class BrevoApiCampaignsService {
    private readonly campaignsApis = new Map<string, Brevo.EmailCampaignsApi>();

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    private getCampaignsApi(scope: EmailCampaignScopeInterface): Brevo.EmailCampaignsApi {
        const existingCampaignsApiForScope = this.campaignsApis.get(JSON.stringify(scope));

        if (existingCampaignsApiForScope) {
            return existingCampaignsApiForScope;
        }

        const { apiKey } = this.config.brevo.resolveConfig(scope);
        const campaignsApi = new Brevo.EmailCampaignsApi();
        campaignsApi.setApiKey(Brevo.EmailCampaignsApiApiKeys.apiKey, apiKey);

        this.campaignsApis.set(JSON.stringify(scope), campaignsApi);

        return campaignsApi;
    }

    public getSendingInformationFromBrevoCampaign(campaign: BrevoApiCampaign): SendingState {
        if (campaign.status === Brevo.GetEmailCampaignsCampaignsInner.StatusEnum.Sent) {
            return SendingState.SENT;
        } else if (
            campaign.status === Brevo.GetEmailCampaignsCampaignsInner.StatusEnum.Queued ||
            campaign.status === Brevo.GetEmailCampaignsCampaignsInner.StatusEnum.InProcess
        ) {
            return SendingState.SCHEDULED;
        }

        return SendingState.DRAFT;
    }

    public async createBrevoCampaign({
        campaign,
        htmlContent,
        scheduledAt,
    }: {
        campaign: EmailCampaignInterface;
        htmlContent: string;
        scheduledAt?: Date;
    }): Promise<number> {
        const targetGroup = await campaign.targetGroup?.load();
        const { sender } = this.config.brevo.resolveConfig(campaign.scope);

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, email: sender.email },
            recipients: { listIds: targetGroup ? [targetGroup?.brevoId] : [] },
            htmlContent,
            scheduledAt: scheduledAt?.toISOString(),
        };

        const data = await this.getCampaignsApi(campaign.scope).createEmailCampaign(emailCampaign);
        return data.body.id;
    }

    public async updateBrevoCampaign({
        id,
        campaign,
        htmlContent,
        scheduledAt,
    }: {
        id: number;
        campaign: EmailCampaignInterface;
        htmlContent: string;
        scheduledAt?: Date;
    }): Promise<boolean> {
        const targetGroup = await campaign.targetGroup?.load();
        const { sender } = this.config.brevo.resolveConfig(campaign.scope);

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, mail: sender.email },
            recipients: { listIds: targetGroup ? [targetGroup?.brevoId] : [] },
            htmlContent,
            scheduledAt: scheduledAt?.toISOString(),
        };

        const result = await this.getCampaignsApi(campaign.scope).updateEmailCampaign(id, emailCampaign);
        return result.response.statusCode === 204;
    }

    public async sendBrevoCampaign(campaign: EmailCampaignInterface): Promise<boolean> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const result = await this.getCampaignsApi(campaign.scope).sendEmailCampaignNow(campaign.brevoId);
        return result.response.statusCode === 204;
    }

    public async updateBrevoCampaignStatus(campaign: EmailCampaignInterface, updatedStatus: Brevo.UpdateCampaignStatus.StatusEnum): Promise<boolean> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const status = new Brevo.UpdateCampaignStatus();
        status.status = updatedStatus;
        const result = await this.getCampaignsApi(campaign.scope).updateCampaignStatus(campaign.brevoId, status);
        return result.response.statusCode === 204;
    }

    public async sendTestEmail(campaign: EmailCampaignInterface, emails: string[]): Promise<boolean> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const result = await this.getCampaignsApi(campaign.scope).sendTestEmail(campaign.brevoId, { emailTo: emails });
        return result.response.statusCode === 204;
    }

    public async loadBrevoCampaignsByIds(ids: number[], scope: EmailCampaignScopeInterface): Promise<BrevoApiCampaign[]> {
        const campaigns = [];
        for await (const campaign of await this.getCampaignsResponse(ids, scope)) {
            campaigns.push(campaign);
        }

        return campaigns;
    }

    public async loadBrevoCampaignById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaign> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }
        const response = await this.getCampaignsApi(campaign.scope).getEmailCampaign(campaign.brevoId);

        // wrong type in brevo library -> needs to be cast to unknown first
        return response.body as unknown as BrevoApiCampaign;
    }

    public async loadBrevoCampaignStatisticsById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaignStatistics> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const brevoCampaign = await this.getCampaignsApi(campaign.scope).getEmailCampaign(campaign.brevoId);

        return brevoCampaign.body.statistics.campaignStats[0];
    }

    private async *getCampaignsResponse(
        ids: number[],
        scope: EmailCampaignScopeInterface,
        status?: "suspended" | "archive" | "sent" | "queued" | "draft" | "inProcess",
    ): AsyncGenerator<BrevoApiCampaign, void, undefined> {
        let offset = 0;
        const limit = 100;

        while (true) {
            const campaignsResponse = await this.getCampaignsApi(scope).getEmailCampaigns(
                undefined,
                status,
                undefined,
                undefined,
                undefined,
                limit,
                offset,
            );
            const campaignArray = (campaignsResponse.body.campaigns ?? []).filter((item) => ids.includes(item.id));

            if (campaignArray.length === 0) {
                break;
            }
            yield* campaignArray;

            offset += limit;
        }
    }
}
