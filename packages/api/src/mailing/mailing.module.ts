import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module } from "@nestjs/common";

import { BrevoModule } from "../brevo-module";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { ConfigModule } from "../config/config.module";
import { MailingInputFactory } from "./dto/mailing-input.factory";
import { MailingEntityFactory } from "./entities/mailing-entity.factory";
import { createMailingsResolver } from "./mailing.resolver";
import { MailingsService } from "./mailings.service";

@Module({})
export class MailingModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        const Mailing = MailingEntityFactory.create({ Scope: config.Scope, MailingContentBlock: config.MailingContentBlock });
        const MailingInput = MailingInputFactory.create({ MailingContentBlock: config.MailingContentBlock });
        const MailingsResolver = createMailingsResolver({ Mailing, MailingInput, Scope: config.Scope });

        return {
            module: MailingModule,
            imports: [ConfigModule, BrevoModule, MikroOrmModule.forFeature([Mailing])],
            providers: [MailingsResolver, MailingsService],
        };
    }
}
