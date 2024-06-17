import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import { SendingState } from "../email-campaign/sending-state.enum";
import { BrevoApiCampaign } from "./dto/brevo-api-campaign";
import { BrevoApiCampaignStatistics } from "./dto/brevo-api-campaign-statistics";

@Injectable()
export class BrevoApiCampaignsService {
    private readonly campaignsApi: SibApiV3Sdk.EmailCampaignsApi;

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {
        this.campaignsApi = new SibApiV3Sdk.EmailCampaignsApi();
    }

    private async getBrevoApiKeyForScope(scope: EmailCampaignScopeInterface): Promise<string> {
        const data = await this.brevoConfigRepository.findOneOrFail({ scope: scope });

        if (!data.apiKey) {
            throw new Error("No api key found for scope");
        }

        return data.apiKey;
    }

    private async setApiKey({ scope }: { scope: EmailCampaignScopeInterface }): Promise<void> {
        const apiKey = await this.getBrevoApiKeyForScope(scope);
        this.campaignsApi.setApiKey(SibApiV3Sdk.EmailCampaignsApiApiKeys.apiKey, apiKey);
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
        await this.setApiKey({ scope: campaign.scope });

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
        await this.setApiKey({ scope: campaign.scope });

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

    public async sendBrevoCampaign({ id, scope }: { id: number; scope: EmailCampaignScopeInterface }): Promise<boolean> {
        await this.setApiKey({ scope });

        const result = await this.campaignsApi.sendEmailCampaignNow(id);
        return result.response.statusCode === 204;
    }

    public async updateBrevoCampaignStatus({
        campaign,
        updatedStatus,
    }: {
        campaign: EmailCampaignInterface;
        updatedStatus: SibApiV3Sdk.UpdateCampaignStatus.StatusEnum;
    }): Promise<boolean> {
        await this.setApiKey({ scope: campaign.scope });

        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const status = new SibApiV3Sdk.UpdateCampaignStatus();
        status.status = updatedStatus;

        const result = await this.campaignsApi.updateCampaignStatus(campaign.brevoId, status);
        return result.response.statusCode === 204;
    }

    public async sendTestEmail(campaign: EmailCampaignInterface, emails: string[]): Promise<boolean> {
        await this.setApiKey({ scope: campaign.scope });

        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const result = await this.campaignsApi.sendTestEmail(campaign.brevoId, { emailTo: emails });
        return result.response.statusCode === 204;
    }

    public async loadBrevoCampaignsByIds(ids: number[], scope: EmailCampaignScopeInterface): Promise<BrevoApiCampaign[]> {
        await this.setApiKey({ scope });

        const campaigns = [];
        for await (const campaign of await this.getCampaignsResponse(ids)) {
            campaigns.push(campaign);
        }

        return campaigns;
    }

    public async loadBrevoCampaign(campaign: EmailCampaignInterface): Promise<BrevoApiCampaign> {
        await this.setApiKey({ scope: campaign.scope });

        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const response = await this.campaignsApi.getEmailCampaign(campaign.brevoId);

        // wrong type in brevo library -> needs to be cast to unknown first
        return response.body as unknown as BrevoApiCampaign;
    }

    public async loadBrevoCampaignStatistics(campaign: EmailCampaignInterface): Promise<BrevoApiCampaignStatistics> {
        await this.setApiKey({ scope: campaign.scope });

        if (!campaign.brevoId) {
            throw new Error("Campaign has no brevoId");
        }

        const brevoCampaign = await this.campaignsApi.getEmailCampaign(campaign.brevoId);

        return brevoCampaign.body.statistics.campaignStats[0];
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
