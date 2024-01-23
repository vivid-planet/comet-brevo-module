import { DynamicModule, Global, Module } from "@nestjs/common";

import { BrevoApiModule } from "./brevo-api/brevo-api.module";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { BrevoModuleConfig } from "./config/brevo-module.config";
import { ConfigModule } from "./config/config.module";
import { EmailCampaignModule } from "./email-campaign/email-campaign.module";
import { TargetGroupModule } from "./target-group/target-group.module";

@Global()
@Module({})
export class BrevoModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        return {
            module: BrevoModule,
            imports: [
                BrevoApiModule,
                BrevoContactModule.register({
                    BrevoContactAttributes: config.brevo.BrevoContactAttributes,
                    BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
                    Scope: config.Scope,
                }),
                EmailCampaignModule.register(config),
                TargetGroupModule,
                ConfigModule.forRoot(config),
            ],
            exports: [],
        };
    }
}
