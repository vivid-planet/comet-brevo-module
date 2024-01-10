import { DynamicModule, Global, Module } from "@nestjs/common";

import { BrevoModule } from "./brevo/brevo.module";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { CometBrevoModuleConfig } from "./config/comet-brevo-module.config";
import { ConfigModule } from "./config/config.module";

@Global()
@Module({})
export class CometBrevoModule {
    static register(config: CometBrevoModuleConfig): DynamicModule {
        return {
            module: CometBrevoModule,
            imports: [BrevoModule, BrevoContactModule, ConfigModule.forRoot(config)],
            exports: [],
        };
    }
}
