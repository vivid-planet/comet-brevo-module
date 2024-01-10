import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoContactsApiService } from "./brevo-contact-api.service";

@Module({
    imports: [ConfigModule],
    providers: [BrevoContactsApiService],
    exports: [BrevoContactsApiService],
})
export class BrevoModule {}
