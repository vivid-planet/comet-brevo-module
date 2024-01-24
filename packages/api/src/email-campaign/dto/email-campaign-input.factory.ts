import { Block, BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { IsNullable, IsUndefinable, RootBlockInputScalar } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, IsUUID, MinDate, ValidateNested } from "class-validator";

export interface EmailCampaignInputInterface {
    title: string;
    subject: string;
    scheduledAt?: Date;
    content: BlockInputInterface;
    targetGroup?: string;
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

            @IsNullable()
            @Field(() => ID, { nullable: true, defaultValue: null })
            @IsUUID()
            targetGroup?: string;

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
