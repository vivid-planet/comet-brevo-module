import { Block, BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { IsUndefinable, RootBlockInputScalar } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, MinDate, ValidateNested } from "class-validator";

export interface EmailCampaignInputInterface {
    title: string;
    subject: string;
    scheduledAt?: Date;
    content: BlockInputInterface;
}

export class EmailCampaignInputFactory {
    static create({ EmailCampaignContentBlock }: { EmailCampaignContentBlock: Block }): Type<EmailCampaignInputInterface> {
        @InputType()
        class EmailCampaignInput implements EmailCampaignInputInterface {
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
            @MinDate(new Date())
            @Field(() => Date, { nullable: true })
            scheduledAt?: Date;

            @Field(() => RootBlockInputScalar(EmailCampaignContentBlock))
            @Transform(({ value }) => (isBlockInputInterface(value) ? value : EmailCampaignContentBlock.blockInputFactory(value)), {
                toClassOnly: true,
            })
            @ValidateNested()
            content: BlockInputInterface;
        }

        return EmailCampaignInput;
    }
}