import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module } from "@nestjs/common";

import { BrevoModule } from "../brevo-module";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { ConfigModule } from "../config/config.module";
import { EmailCampaignInputFactory } from "./dto/email-campaign-input.factory";
import { createEmailCampaignsResolver } from "./email-campaign.resolver";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignEntityFactory } from "./entities/email-campaign-entity.factory";

@Module({})
export class EmailCampaignModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        const EmailCampaign = EmailCampaignEntityFactory.create({ Scope: config.Scope, EmailCampaignContentBlock: config.EmailCampaignContentBlock });
        const EmailCampaignInput = EmailCampaignInputFactory.create({ EmailCampaignContentBlock: config.EmailCampaignContentBlock });
        const EmailCampaignsResolver = createEmailCampaignsResolver({ EmailCampaign, EmailCampaignInput, Scope: config.Scope });

        return {
            module: EmailCampaignModule,
            imports: [ConfigModule, BrevoModule, MikroOrmModule.forFeature([EmailCampaign])],
            providers: [EmailCampaignsResolver, EmailCampaignsService],
        };
    }
}
