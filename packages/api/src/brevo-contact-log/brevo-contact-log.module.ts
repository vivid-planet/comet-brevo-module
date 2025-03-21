import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { BrevoContactLogService } from "./brevo-contact-log.service";
import { BrevoContactLogInterface } from "./entity/brevo-contact-log.entity.factory";

interface BrevoContactLogModuleConfig {
    BrevoContactLog: Type<BrevoContactLogInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}

@Module({})
export class BrevoContactLogModule {
    static register({ Scope, BrevoContactLog }: BrevoContactLogModuleConfig): DynamicModule {
        return {
            module: BrevoContactLogModule,
            imports: [ConfigModule, BrevoApiModule, MikroOrmModule.forFeature([BrevoContactLog])],
            providers: [BrevoContactLogService],
            exports: [BrevoContactLogService],
        };
    }
}
