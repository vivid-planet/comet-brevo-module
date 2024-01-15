import { Module } from "@nestjs/common";

import { BrevoModule } from "../brevo/brevo.module";
import { BrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";

@Module({
    imports: [BrevoModule],
    providers: [BrevoContactsService, BrevoContactResolver],
})
export class BrevoContactModule {}
