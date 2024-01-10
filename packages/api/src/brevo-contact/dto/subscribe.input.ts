import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, IsUrl, Validate } from "class-validator";

import { IsValidRedirectURLConstraint } from "../validator/redirect-url.validator";

@InputType()
export class SubscribeInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    firstName: string;

    @Field()
    @IsString()
    lastName: string;

    @Field()
    @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
    @Validate(IsValidRedirectURLConstraint)
    redirectURL: string;
}
