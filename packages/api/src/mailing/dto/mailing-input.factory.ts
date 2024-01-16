import { Block, BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { IsUndefinable, RootBlockInputScalar } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export interface MailingInputInterface {
    title: string;
    subject: string;
    scheduledAt?: Date;
    content: BlockInputInterface;
}

export class MailingInputFactory {
    static create({ MailingContentBlock }: { MailingContentBlock: Block }): Type<MailingInputInterface> {
        @InputType()
        class MailingInput implements MailingInputInterface {
            @IsNotEmpty()
            @IsString()
            @Field()
            title: string;

            @IsNotEmpty()
            @IsString()
            @Field()
            subject: string;

            @IsUndefinable()
            @IsDate()
            @Field({ nullable: true })
            scheduledAt?: Date;

            @Field(() => RootBlockInputScalar(MailingContentBlock))
            @Transform(({ value }) => (isBlockInputInterface(value) ? value : MailingContentBlock.blockInputFactory(value)), { toClassOnly: true })
            @ValidateNested()
            content: BlockInputInterface;
        }

        return MailingInput;
    }
}
