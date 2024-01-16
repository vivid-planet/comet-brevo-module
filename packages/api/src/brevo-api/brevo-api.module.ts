import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoApiContactsService } from "./brevo-api-contact.service";

@Module({
    imports: [ConfigModule],
    providers: [BrevoApiContactsService],
    exports: [BrevoApiContactsService],
})
export class BrevoApiModule {}
