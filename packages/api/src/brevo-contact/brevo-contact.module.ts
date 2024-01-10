import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { BrevoModule } from "../brevo/brevo.module";
import { ConfigModule } from "../config/config.module";
import { BrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator";

@Module({
    imports: [MikroOrmModule.forFeature([]), BrevoModule, ConfigModule],
    providers: [BrevoContactsService, BrevoContactResolver, EcgRtrListService, IsValidRedirectURLConstraint],
})
export class BrevoContactModule {}
