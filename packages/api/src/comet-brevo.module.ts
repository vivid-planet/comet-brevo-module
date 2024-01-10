import { DynamicModule, Global, Module, ValueProvider } from "@nestjs/common";

import { BrevoModule } from "./brevo/brevo.module";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { CometBrevoModuleConfig } from "./config/comet-brevo-module.config";
import { COMET_BREVO_MODULE_CONFIG } from "./config/comet-brevo-module.constants";

@Global()
@Module({})
export class CometBrevoModule {
    static register(config: CometBrevoModuleConfig): DynamicModule {
        const CometBrevoModuleConfigProvider: ValueProvider<CometBrevoModuleConfig> = {
            provide: COMET_BREVO_MODULE_CONFIG,
            useValue: config,
        };

        return {
            module: CometBrevoModule,
            imports: [BrevoModule, BrevoContactModule],
            providers: [CometBrevoModuleConfigProvider],
            exports: [],
        };
    }
}
