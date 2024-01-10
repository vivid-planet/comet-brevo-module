import { DynamicModule, Global, Module } from "@nestjs/common";

import { CometBrevoModuleConfig } from "./comet-brevo-module.config";
import { COMET_BREVO_MODULE_CONFIG } from "./comet-brevo-module.constants";

@Global()
@Module({})
export class ConfigModule {
    static forRoot(config: CometBrevoModuleConfig): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: COMET_BREVO_MODULE_CONFIG,
                    useValue: config,
                },
            ],
            exports: [COMET_BREVO_MODULE_CONFIG],
        };
    }
}
