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
        // Here, the application should add logic to handle reCAPTCHA verification
        // This ensures that the request is coming from a human and not a bot

        const { scope, ...input } = data;

        return this.brevoContactsService.subscribeBrevoContact(input, data.scope);
    }
}
