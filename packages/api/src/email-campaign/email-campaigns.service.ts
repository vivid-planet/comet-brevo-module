import { BlocksTransformerService, filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { EntityManager, EntityRepository, ObjectQuery, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { UpdateCampaignStatus } from "@sendinblue/client";

import { BrevoApiCampaignsService } from "../brevo-api/brevo-api-campaigns.service";
import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignFilter } from "./dto/email-campaign.filter";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";

@Injectable()
export class EmailCampaignsService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("EmailCampaign") private readonly repository: EntityRepository<EmailCampaignInterface>,
        private readonly httpService: HttpService,
        private readonly brevoApiCampaignService: BrevoApiCampaignsService,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly entityManager: EntityManager,
        private readonly ecgRtrListService: EcgRtrListService,
        private readonly blockTransformerService: BlocksTransformerService,
    ) {}

    getFindCondition(options: { search?: string; filter?: EmailCampaignFilter }): ObjectQuery<EmailCampaignInterface> {
        const andFilters = [];

        if (options.search) {
            andFilters.push(searchToMikroOrmQuery(options.search, ["title", "subject"]));
        }

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }

    async saveEmailCampaignInBrevo(id: string, scheduledAt?: Date): Promise<EmailCampaignInterface> {
        const campaign = await this.repository.findOneOrFail(id);

        const content = await this.blockTransformerService.transformToPlain(campaign.content);

        const { data: htmlContent, status } = await this.httpService.axiosRef.post(
            this.config.emailCampaigns.frontend.url,
            { title: campaign.title, content, scope: campaign.scope },
            {
                headers: { "Content-Type": "application/json" },
                auth: {
                    username: this.config.emailCampaigns.frontend.basicAuth.username,
                    password: this.config.emailCampaigns.frontend.basicAuth.password,
                },
            },
        );

        if (!htmlContent || status !== 200) {
            throw new Error("Could not generate campaign content");
        }

        let brevoId = campaign.brevoId;
        if (!brevoId) {
            brevoId = await this.brevoApiCampaignService.createBrevoCampaign(campaign, htmlContent, scheduledAt);

            wrap(campaign).assign({ brevoId });

            await this.entityManager.flush();
        } else {
            await this.brevoApiCampaignService.updateBrevoCampaign(brevoId, campaign, htmlContent, scheduledAt);
        }

        return campaign;
    }

    async suspendEmailCampaign(brevoId: number): Promise<boolean> {
        return this.brevoApiCampaignService.updateBrevoCampaignStatus(brevoId, UpdateCampaignStatus.StatusEnum.Suspended);
    }

    public async loadEmailCampaignSendingStatesForEmailCampaigns(campaigns: EmailCampaignInterface[]): Promise<EmailCampaignInterface[]> {
        const brevoIds = campaigns.map((campaign) => campaign.brevoId).filter((campaign) => campaign) as number[];

        if (brevoIds.length > 0) {
            const brevoCampaigns = await this.brevoApiCampaignService.loadBrevoCampaignsByIds(brevoIds);

            for (const brevoCampaign of brevoCampaigns) {
                const sendingState = this.brevoApiCampaignService.getSendingInformationFromBrevoCampaign(brevoCampaign);

                const campaign = campaigns.find((campaign) => campaign.brevoId === brevoCampaign.id);
                if (campaign) {
                    campaign.sendingState = sendingState;
                }
            }
        }

        return campaigns;
    }

    public async sendEmailCampaignNow(id: string): Promise<boolean> {
        const campaign = await this.saveEmailCampaignInBrevo(id);

        const targetGroup = await campaign.targetGroup?.load();

        if (targetGroup?.brevoId) {
            let currentOffset = 0;
            let totalContacts = 0;
            const limit = 50;
            do {
                const [contacts, total] = await this.brevoApiContactsService.findContactsByListId(targetGroup.brevoId, limit, currentOffset);
                const emails = contacts.map((contact) => contact.email);
                const containedEmails = await this.ecgRtrListService.getContainedEcgRtrListEmails(emails);

                if (containedEmails.length > 0) {
                    await this.brevoApiContactsService.blacklistMultipleContacts(containedEmails);
                }

                if (campaign.brevoId) {
                    return this.brevoApiCampaignService.sendBrevoCampaign(campaign.brevoId);
                }

                currentOffset += limit;
                totalContacts = total;
            } while (currentOffset < totalContacts);
        }

        return false;
    }
}
