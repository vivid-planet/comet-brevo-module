import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoApiAccountService } from "./brevo-api-account.service";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiContactsService } from "./brevo-api-contact.service";
import { BrevoApiSenderService } from "./brevo-api-sender.service";
import { BrevoApiTransactionalEmailsApiService } from "./brevo-api-transactional-emails.service";

@Module({
    imports: [ConfigModule],
    providers: [
        BrevoApiContactsService,
        BrevoApiCampaignsService,
        BrevoApiSenderService,
        BrevoApiTransactionalEmailsApiService,
        BrevoApiAccountService,
    ],
    exports: [
        BrevoApiContactsService,
        BrevoApiCampaignsService,
        BrevoApiSenderService,
        BrevoApiTransactionalEmailsApiService,
        BrevoApiAccountService,
    ],
})
export class BrevoApiModule {}
