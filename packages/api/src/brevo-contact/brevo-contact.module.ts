import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { BrevoModule } from "../brevo/brevo.module";
import { BrevoContactResolver } from "./brevo-contact.resolver";
import { BrevoContactService } from "./brevo-contact.service";

@Module({
    imports: [MikroOrmModule.forFeature([]), BrevoModule],
    providers: [BrevoContactService, BrevoContactResolver],
})
export class BrevoContactModule {}
