import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { BrevoModule } from "../brevo/brevo.module";
import { BrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";

@Module({
    imports: [MikroOrmModule.forFeature([]), BrevoModule],
    providers: [BrevoContactsService, BrevoContactResolver],
})
export class BrevoContactModule {}
