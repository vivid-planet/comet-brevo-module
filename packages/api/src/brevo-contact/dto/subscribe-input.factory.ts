import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsEmail, IsUrl, Validate, ValidateNested } from "class-validator";

import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../../types";
import { IsValidRedirectURLConstraint } from "../validator/redirect-url.validator";

export interface SubscribeInputInterface {
    email: string;
    redirectionUrl: string;
    attributes?: BrevoContactAttributesInterface;
    scope: EmailCampaignScopeInterface;
}

export class SubscribeInputFactory {
    static create({
        BrevoContactAttributes,
        Scope,
    }: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        Scope: Type<EmailCampaignScopeInterface>;
    }): Type<SubscribeInputInterface> {
        @InputType({ isAbstract: true })
        class SubscribeInputBase implements SubscribeInputInterface {
            @Field()
            @IsEmail()
            email: string;

            @Field()
            @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
            @Validate(IsValidRedirectURLConstraint)
            redirectionUrl: string;

            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: EmailCampaignScopeInterface;
        }

        if (BrevoContactAttributes) {
            @InputType()
            class SubscribeInput extends SubscribeInputBase {
                @Field(() => BrevoContactAttributes)
                attributes?: BrevoContactAttributesInterface;
            }

            return SubscribeInput;
        }

        @InputType()
        class SubscribeInput extends SubscribeInputBase {}

        return SubscribeInput;
    }
}
