import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEmail, IsInt, IsNotEmpty, IsString, ValidateIf } from "class-validator";

@InputType()
export class BrevoConfigInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    apiKey: string;
}

@InputType()
export class BrevoConfigUpdateInput {
    @IsNotEmpty()
    @IsString()
    @Field({ nullable: true })
    @ValidateIf((values) => !values.senderMail)
    apiKey?: string;

    @IsNotEmpty()
    @IsString()
    @Field({ nullable: true })
    @IsEmail()
    @ValidateIf((values) => !values.apiKey)
    senderMail?: string;

    @IsNotEmpty()
    @IsString()
    @Field({ nullable: true })
    @ValidateIf((values) => !values.apiKey)
    senderName?: string;

    @IsNotEmpty()
    @IsInt()
    @Field(() => Int, { nullable: true })
    @ValidateIf((values) => !values.apiKey)
    doiTemplateId?: number;
}
