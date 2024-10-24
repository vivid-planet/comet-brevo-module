import { IsUndefinable, PartialType } from "@comet/cms-api";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEmail, IsInt, IsNotEmpty, IsString, IsUrl, ValidateIf } from "class-validator";

@InputType()
export class BrevoConfigInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    @IsEmail()
    senderMail: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    senderName: string;

    @IsNotEmpty()
    @IsInt()
    @Field(() => Int, { nullable: true })
    @ValidateIf((values) => !values.apiKey)
    doiTemplateId?: number;

    @IsNotEmpty()
    @Field()
    @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
    redirectionUrl: string;

    @IsUndefinable()
    @IsString()
    @Field()
    unsubscriptionPageId?: string;
}

@InputType()
export class BrevoConfigUpdateInput extends PartialType(BrevoConfigInput) {}
