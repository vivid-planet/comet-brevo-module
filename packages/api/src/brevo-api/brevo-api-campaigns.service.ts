import * as Brevo from "@getbrevo/brevo";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
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

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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
        const targetGroups = await campaign.targetGroups.loadItems();
        const { sender } = this.config.brevo.resolveConfig(campaign.scope);

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, email: sender.email },
            recipients: { listIds: targetGroups.map((targetGroup) => targetGroup.brevoId) },
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
        const targetGroups = await campaign.targetGroups.loadItems();
        const { sender } = this.config.brevo.resolveConfig(campaign.scope);

        const emailCampaign = {
            name: campaign.title,
            subject: campaign.subject,
            sender: { name: sender.name, mail: sender.email },
            recipients: { listIds: targetGroups.map((targetGroup) => targetGroup.brevoId) },
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
        const brevoCampaigns = [];
        const nonCachedIds = [];

        for (const brevoId of ids) {
            const cachedCampaign: BrevoApiCampaign | undefined = await this.cacheManager.get(`brevo-campaign-${brevoId}`);
            if (cachedCampaign) {
                brevoCampaigns.push(cachedCampaign);
            } else {
                nonCachedIds.push(brevoId);
            }
        }

        for await (const campaign of this.getCampaignsResponse(nonCachedIds, scope)) {
            brevoCampaigns.push(campaign);
            await this.cacheManager.set(`brevo-campaign-${campaign.id}`, campaign);
        }

        return brevoCampaigns;
    }

    public async loadBrevoCampaignById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaign> {
        const brevoId = campaign.brevoId;
        if (brevoId == undefined) {
            throw new Error("Campaign has no brevoId");
        }

        return this.cacheManager.wrap<BrevoApiCampaign>(`brevo-campaign-${campaign.id}`, async () => {
            const response = await this.getCampaignsApi(campaign.scope).getEmailCampaign(brevoId);

            return response.body;
        });
    }

    public async loadBrevoCampaignStatisticsById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaignStatistics> {
        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const brevoCampaign = await this.loadBrevoCampaignById(campaign);

        // The property globalStats seems to be right here according to the docs: https://developers.brevo.com/reference/getemailcampaign
        // Unforunately, the API returns only 0 values for the globalStats property.
        // That's why we return the first element of the campaignStats array, which contains the correct values.
        return brevoCampaign.statistics.campaignStats[0];
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
