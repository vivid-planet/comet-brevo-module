import { PartialType } from "@comet/cms-api";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";

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

    @IsInt()
    @Field(() => Int)
    doiTemplateId: number;
}

@InputType()
export class BrevoConfigUpdateInput extends PartialType(BrevoConfigInput) {}
