import { DynamicModule, Global, Module } from "@nestjs/common";

import { BrevoApiModule } from "./brevo-api/brevo-api.module";
import { BrevoConfigModule } from "./brevo-config/brevo-config.module";
import { BrevoConfigEntityFactory } from "./brevo-config/entities/brevo-config-entity.factory";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { BrevoModuleConfig } from "./config/brevo-module.config";
import { ConfigModule } from "./config/config.module";
import { EmailCampaignModule } from "./email-campaign/email-campaign.module";
import { TargetGroupEntityFactory } from "./target-group/entity/target-group-entity.factory";
import { TargetGroupModule } from "./target-group/target-group.module";

@Global()
@Module({})
export class BrevoModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        const TargetGroup = TargetGroupEntityFactory.create({
            Scope: config.emailCampaigns.Scope,
            BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
        });

        const BrevoConfig = BrevoConfigEntityFactory.create({
            Scope: config.emailCampaigns.Scope,
        });

        return {
            module: BrevoModule,
            imports: [
                BrevoApiModule,
                BrevoContactModule.register({
                    BrevoContactAttributes: config.brevo.BrevoContactAttributes,
                    Scope: config.emailCampaigns.Scope,
                    TargetGroup,
                }),
                EmailCampaignModule.register({
                    EmailCampaignContentBlock: config.emailCampaigns.EmailCampaignContentBlock,
                    Scope: config.emailCampaigns.Scope,
                    TargetGroup,
                    BrevoConfig,
                }),
                TargetGroupModule.register({
                    Scope: config.emailCampaigns.Scope,
                    BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
                    TargetGroup: TargetGroup,
                }),
                BrevoConfigModule.register({ BrevoConfig, Scope: config.emailCampaigns.Scope }),
                ConfigModule.forRoot(config),
            ],
            exports: [TargetGroupModule, BrevoContactModule, BrevoApiModule],
        };
    }
}
