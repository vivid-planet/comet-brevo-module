import { DisableGlobalGuard } from "@comet/cms-api";
import { Body, Controller, Post, Type as NestType } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsUrl, Validate, ValidateNested } from "class-validator";
import { BrevoContactAttributesInterface } from "src/types";

import { EmailCampaignScopeInterface } from "../types";
import { BrevoContactsService } from "./brevo-contacts.service";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator";

export function createBrevoContactController({
    BrevoContactAttributes,
    Scope,
}: {
    BrevoContactAttributes?: NestType<BrevoContactAttributesInterface>;
    Scope: NestType<EmailCampaignScopeInterface>;
}): NestType<unknown> {
    class SubscribeInputBase {
        @IsEmail()
        email: string;

        @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
        @Validate(IsValidRedirectURLConstraint)
        redirectionUrl: string;

        @IsNotEmpty()
        @Type(() => Scope)
        @ValidateNested()
        scope: typeof Scope;
    }

    class SubscribeInputWithAttributes extends SubscribeInputBase {
        @IsNotEmpty()
        @Type(typeof BrevoContactAttributes !== "undefined" ? () => BrevoContactAttributes : undefined)
        @ValidateNested()
        attributes: typeof BrevoContactAttributes;
    }

    class SubscribeInput extends (typeof BrevoContactAttributes !== "undefined" ? SubscribeInputWithAttributes : SubscribeInputBase) {}

    @Controller("brevo-contacts")
    class BrevoContactsController {
        constructor(private readonly brevoContactsService: BrevoContactsService) {}

        @DisableGlobalGuard()
        @Post(`/subscribe`)
        async subscribe(@Body() data: SubscribeInput): Promise<SubscribeResponse> {
            const { scope, ...input } = data;

            return this.brevoContactsService.subscribeBrevoContact(input, data.scope);
        }
    }

    return BrevoContactsController;
}
