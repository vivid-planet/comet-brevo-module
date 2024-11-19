import { IsUndefinable, PartialType } from "@comet/cms-api";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEmail, IsInt, IsNotEmpty, IsString, ValidateIf } from "class-validator";

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

    @IsUndefinable()
    @IsInt()
    @Field(() => Int, { nullable: true })
    @ValidateIf((values) => !values.apiKey)
    doiTemplateId?: number;
}

@InputType()
export class BrevoConfigUpdateInput extends PartialType(BrevoConfigInput) {}
