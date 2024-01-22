import { MikroOrmModule } from "@mikro-orm/nestjs";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { ConfigModule } from "../config/config.module";
import { EmailCampaignInputFactory } from "./dto/email-campaign-input.factory";
import { createEmailCampaignsResolver } from "./email-campaign.resolver";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignEntityFactory } from "./entities/email-campaign-entity.factory";

@Module({})
export class EmailCampaignModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        const EmailCampaign = EmailCampaignEntityFactory.create({
            Scope: config.emailCampaigns.Scope,
            EmailCampaignContentBlock: config.emailCampaigns.EmailCampaignContentBlock,
        });
        const EmailCampaignInput = EmailCampaignInputFactory.create({ EmailCampaignContentBlock: config.emailCampaigns.EmailCampaignContentBlock });
        const EmailCampaignsResolver = createEmailCampaignsResolver({ EmailCampaign, EmailCampaignInput, Scope: config.emailCampaigns.Scope });

        return {
            module: EmailCampaignModule,
            imports: [
                ConfigModule,
                BrevoApiModule,
                HttpModule.register({
                    timeout: 5000,
                }),
                MikroOrmModule.forFeature([EmailCampaign]),
            ],
            providers: [EmailCampaignsResolver, EmailCampaignsService, EcgRtrListService],
        };
    }
}
