import { FileUploadsService } from "@comet/cms-api";
import { FileUploadsConfig } from "@comet/cms-api/lib/file-uploads/file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "@comet/cms-api/lib/file-uploads/file-uploads.constants";
import { DynamicModule, Global, Module, Optional } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { BrevoApiModule } from "./brevo-api/brevo-api.module";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { BrevoModuleConfig } from "./config/brevo-module.config";
import { ConfigModule } from "./config/config.module";
import { EmailCampaignModule } from "./email-campaign/email-campaign.module";
import { TargetGroupEntityFactory } from "./target-group/entity/target-group-entity.factory";
import { TargetGroupModule } from "./target-group/target-group.module";

@Global()
@Module({})
export class BrevoModule {
    constructor(private readonly moduleRef: ModuleRef, @Optional() private readonly myGlobalService: FileUploadsService) {
        let fileUploadsConfig: FileUploadsConfig | undefined;
        try {
            fileUploadsConfig = this.moduleRef.get(FILE_UPLOADS_CONFIG, { strict: false });
        } catch (error) {
            throw new Error("FileUploadsModule is an required import for BrevoModule");
        }

        if (fileUploadsConfig && !fileUploadsConfig.acceptedMimeTypes.includes("text/csv")) {
            throw new Error("BrevoModule requires mime type 'text/csv' in FileUploadsModule's config");
        }
    }
    static register(config: BrevoModuleConfig): DynamicModule {
        const TargetGroup = TargetGroupEntityFactory.create({
            Scope: config.emailCampaigns.Scope,
            BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
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
                }),
                TargetGroupModule.register({
                    Scope: config.emailCampaigns.Scope,
                    BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
                    TargetGroup: TargetGroup,
                }),
                ConfigModule.forRoot(config),
            ],
            exports: [TargetGroupModule, BrevoContactModule, BrevoApiModule],
        };
    }
}
