import { Module } from "@nestjs/common";

import { BrevoContactService } from "./brevo-contact.service";

@Module({
    // imports: [ConfigModule],
    providers: [BrevoContactService],
    exports: [BrevoContactService],
})
export class BrevoModule {}
