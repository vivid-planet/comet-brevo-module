import { Module } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { BrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";

@Module({
    imports: [BrevoApiModule],
    providers: [BrevoContactsService, BrevoContactResolver],
})
export class BrevoContactModule {}
