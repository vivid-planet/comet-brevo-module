import { DynamicModule, Global, Module } from "@nestjs/common";

import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { BrevoModuleConfig } from "./config/brevo-module.config";
import { ConfigModule } from "./config/config.module";

@Global()
@Module({})
export class BrevoModule {
    static register(config: BrevoModuleConfig): DynamicModule {
        return {
            module: BrevoModule,
            imports: [BrevoModule, BrevoContactModule, ConfigModule.forRoot(config)],
            exports: [],
        };
    }
}
