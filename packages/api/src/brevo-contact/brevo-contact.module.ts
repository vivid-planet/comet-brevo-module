import { DynamicModule, Module } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { BrevoContactAttributesInterface } from "../types";
import { createBrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactFactory } from "./dto/brevo-contact.factory";
import { SubscribeInputFactory } from "./dto/subscribe-input.factory";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator";

interface BrevoContactModuleConfig {
    BrevoContactAttributes?: BrevoContactAttributesInterface;
}

@Module({})
export class BrevoContactModule {
    static register({ BrevoContactAttributes }: BrevoContactModuleConfig): DynamicModule {
        const BrevoContact = BrevoContactFactory.create({ BrevoContactAttributes });
        const BrevoContactSubscribeInput = SubscribeInputFactory.create({ BrevoContactAttributes });
        const BrevoContactResolver = createBrevoContactResolver({ BrevoContact, BrevoContactSubscribeInput });

        return {
            module: BrevoContactModule,
            imports: [BrevoApiModule, ConfigModule],
            providers: [BrevoContactsService, BrevoContactResolver, EcgRtrListService, IsValidRedirectURLConstraint],
        };
    }
}
