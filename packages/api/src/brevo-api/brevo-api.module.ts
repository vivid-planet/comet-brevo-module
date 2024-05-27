import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiContactsService } from "./brevo-api-contact.service";
import { BrevoApiSenderService } from "./brevo-api-sender.service";

@Module({
    imports: [ConfigModule],
    providers: [BrevoApiContactsService, BrevoApiCampaignsService, BrevoApiSenderService],
    exports: [BrevoApiContactsService, BrevoApiCampaignsService, BrevoApiSenderService],
})
export class BrevoApiModule {}
