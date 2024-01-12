import { IsNullable, PartialType } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class MailingInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    subject: string;

    @IsNullable()
    @IsDate()
    @Field({ nullable: true })
    scheduledAt?: Date;
}

@InputType()
export class MailingUpdateInput extends PartialType(MailingInput) {}
