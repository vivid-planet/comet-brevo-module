import { DynamicModule, Module } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { BrevoContactAttributesInterface } from "../types";
import { createBrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactFactory } from "./dto/brevo-contact.factory";

interface BrevoContactModuleConfig {
    BrevoContactAttributes?: BrevoContactAttributesInterface;
}

@Module({})
export class BrevoContactModule {
    static register({ BrevoContactAttributes }: BrevoContactModuleConfig): DynamicModule {
        const BrevoContact = BrevoContactFactory.create({ BrevoContactAttributes });
        const BrevoContactResolver = createBrevoContactResolver({ BrevoContact });

        return {
            module: BrevoContactModule,
            imports: [BrevoApiModule],
            providers: [BrevoContactsService, BrevoContactResolver],
        };
    }
}
