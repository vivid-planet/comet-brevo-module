import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { DeleteUnsubscribedContactsConsole } from "./brevo-contact.console";
import { createBrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactFactory } from "./dto/brevo-contact.factory";
import { BrevoContactInputFactory } from "./dto/brevo-contact-input.factory";
import { SubscribeInputFactory } from "./dto/subscribe-input.factory";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator";

interface BrevoContactModuleConfig {
    BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
    TargetGroup: Type<TargetGroupInterface>;
}

@Module({})
export class BrevoContactModule {
    static register({ BrevoContactAttributes, Scope, TargetGroup }: BrevoContactModuleConfig): DynamicModule {
        const BrevoContact = BrevoContactFactory.create({ BrevoContactAttributes });
        const BrevoContactSubscribeInput = SubscribeInputFactory.create({ BrevoContactAttributes, Scope });
        const [BrevoContactInput, BrevoContactUpdateInput] = BrevoContactInputFactory.create({ BrevoContactAttributes });
        const BrevoContactResolver = createBrevoContactResolver({
            BrevoContact,
            BrevoContactSubscribeInput,
            Scope,
            BrevoContactInput,
            BrevoContactUpdateInput,
        });

        return {
            module: BrevoContactModule,
            imports: [BrevoApiModule, ConfigModule, MikroOrmModule.forFeature([TargetGroup])],
            providers: [BrevoContactsService, BrevoContactResolver, EcgRtrListService, IsValidRedirectURLConstraint, DeleteUnsubscribedContactsConsole],
        };
    }
}
