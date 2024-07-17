import { BrevoContactsService, SubscribeResponse } from "@comet/brevo-api";
import { DisableGlobalGuard } from "@comet/cms-api";
import { Body, Controller, Post } from "@nestjs/common";

import { BrevoContactSubscribeInput } from "./dto/brevo-contact-subscribe.input";

@Controller("brevo-contacts")
export class BrevoContactSubscribeController {
    constructor(private readonly brevoContactsService: BrevoContactsService) {}

    @DisableGlobalGuard()
    @Post(`/subscribe`)
    async subscribe(@Body() data: BrevoContactSubscribeInput): Promise<SubscribeResponse> {
        const { scope, ...input } = data;

        return this.brevoContactsService.subscribeBrevoContact(input, data.scope);
    }
}
