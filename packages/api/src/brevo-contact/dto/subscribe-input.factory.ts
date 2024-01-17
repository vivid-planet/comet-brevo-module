import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsUrl, Validate } from "class-validator";

import { BrevoContactAttributesInterface } from "../../types";
import { IsValidRedirectURLConstraint } from "../validator/redirect-url.validator";

export interface SubscribeInputInterface {
    email: string;
    redirectionUrl: string;
    attributes: BrevoContactAttributesInterface;
}

export class SubscribeInputFactory {
    static create({ BrevoContactAttributes }: { BrevoContactAttributes: BrevoContactAttributesInterface }): Type<SubscribeInputInterface> {
        @InputType()
        class SubscribeInput implements SubscribeInputInterface {
            @Field(() => BrevoContactAttributes)
            attributes: typeof BrevoContactAttributes;

            @Field()
            @IsEmail()
            email: string;

            @Field()
            @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
            @Validate(IsValidRedirectURLConstraint)
            redirectionUrl: string;
        }

        return SubscribeInput;
    }
}
