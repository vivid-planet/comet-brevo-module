import { PublicUploadsService } from "@comet/cms-api";
import { PublicUploadConfig } from "@comet/cms-api/lib/public-upload/public-upload.config";
import { PUBLIC_UPLOAD_CONFIG } from "@comet/cms-api/lib/public-upload/public-upload.constants";
import { DynamicModule, Global, Module, Optional } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

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
    constructor(private readonly moduleRef: ModuleRef, @Optional() private readonly myGlobalService: PublicUploadsService) {
        let publicUploadsConfig: PublicUploadConfig | undefined;
        try {
            publicUploadsConfig = this.moduleRef.get(PUBLIC_UPLOAD_CONFIG, { strict: false });
        } catch (error) {
            throw new Error("PublicUploadModule is an required import for BrevoModule");
        }

        if (publicUploadsConfig && !publicUploadsConfig.acceptedMimeTypes.includes("text/csv")) {
            throw new Error("BrevoModule requires mime type 'text/csv' in PublicUploadModule's config");
        }
    }
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
