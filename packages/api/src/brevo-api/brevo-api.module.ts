import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiContactsService } from "./brevo-api-contact.service";
import { BrevoTransactionalMailsService } from "./brevo-api-transactional-mails.service";

@Module({
    imports: [ConfigModule, CacheModule.register({ ttl: 1000 * 60 })],
    providers: [BrevoApiContactsService, BrevoApiCampaignsService, BrevoTransactionalMailsService],
    exports: [BrevoApiContactsService, BrevoApiCampaignsService, BrevoTransactionalMailsService],
})
export class BrevoApiModule {}
