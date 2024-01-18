import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module } from "@nestjs/common";

import { BrevoModule } from "../brevo-module";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { ConfigModule } from "../config/config.module";
import { createCampaignsResolver } from "./campaign.resolver";
import { CampaignsService } from "./campaigns.service";
import { CampaignInputFactory } from "./dto/campaign-input.factory";
import { CampaignEntityFactory } from "./entities/campaign-entity.factory";

@Module({})
export class CampaignModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        const Campaign = CampaignEntityFactory.create({ Scope: config.Scope, CampaignContentBlock: config.CampaignContentBlock });
        const CampaignInput = CampaignInputFactory.create({ CampaignContentBlock: config.CampaignContentBlock });
        const CampaignsResolver = createCampaignsResolver({ Campaign, CampaignInput, Scope: config.Scope });

        return {
            module: CampaignModule,
            imports: [ConfigModule, BrevoModule, MikroOrmModule.forFeature([Campaign])],
            providers: [CampaignsResolver, CampaignsService],
        };
    }
}
