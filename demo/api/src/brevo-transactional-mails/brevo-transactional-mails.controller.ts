import { BrevoTransactionalMailsService } from "@comet/brevo-api";
import { DisableGlobalGuard } from "@comet/cms-api";
import { Body, Controller, Post } from "@nestjs/common";

import { BrevoTransactionalMailsBody } from "./dto/transactional-mails.body";

@Controller("transactional-mails")
export class BrevoTransactionalMailsController {
    constructor(private readonly brevoTransactionalMailsService: BrevoTransactionalMailsService) {}

    @DisableGlobalGuard()
    @Post(`/send`)
    async send(@Body() data: BrevoTransactionalMailsBody): Promise<void> {
        const { text } = data;
        await this.brevoTransactionalMailsService.send({ to: [{ email: data.to }], textContent: text, subject: data.subject }, data.scope);
    }
}
