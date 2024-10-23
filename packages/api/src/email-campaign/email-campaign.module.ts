import { Block } from "@comet/blocks-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { ConfigModule } from "../config/config.module";
import { EmailCampaignScopeInterface } from "../types";
import { EmailCampaignInputFactory } from "./dto/email-campaign-input.factory";
import { createEmailCampaignsResolver } from "./email-campaign.resolver";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignEntityFactory } from "./entities/email-campaign-entity.factory";

interface EmailCampaignModuleConfig {
    Scope: Type<EmailCampaignScopeInterface>;
    EmailCampaignContentBlock: Block;
    TargetGroup: Type<TargetGroupInterface>;
    BrevoConfig: Type<BrevoConfigInterface>;
}

@Module({})
export class EmailCampaignModule {
    static register({ Scope, EmailCampaignContentBlock, TargetGroup, BrevoConfig }: EmailCampaignModuleConfig): DynamicModule {
        const EmailCampaign = EmailCampaignEntityFactory.create({
            Scope,
            EmailCampaignContentBlock,
            TargetGroup,
        });
        const [EmailCampaignInput, EmailCampaignUpdateInput] = EmailCampaignInputFactory.create({ EmailCampaignContentBlock });
        const EmailCampaignsResolver = createEmailCampaignsResolver({
            EmailCampaign,
            EmailCampaignInput,
            EmailCampaignUpdateInput,
            Scope,
            TargetGroup,
        });

        return {
            module: EmailCampaignModule,
            imports: [
                ConfigModule,
                BrevoApiModule,
                HttpModule.register({
                    timeout: 5000,
                }),
                MikroOrmModule.forFeature([EmailCampaign, TargetGroup, BrevoConfig]),
            ],
            providers: [EmailCampaignsResolver, EmailCampaignsService, EcgRtrListService],
        };
    }
}
