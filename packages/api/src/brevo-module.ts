import { DynamicModule, Global, Module } from "@nestjs/common";

import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { CometBrevoModuleConfig } from "./config/comet-brevo-module.config";
import { ConfigModule } from "./config/config.module";

@Global()
@Module({})
export class BrevoModule {
    static register(config: CometBrevoModuleConfig): DynamicModule {
        return {
            module: BrevoModule,
            imports: [BrevoModule, BrevoContactModule, ConfigModule.forRoot(config)],
            exports: [],
        };
    }
}
