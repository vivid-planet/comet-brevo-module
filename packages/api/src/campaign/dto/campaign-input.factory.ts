import { Block, BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { IsUndefinable, RootBlockInputScalar } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export interface CampaignInputInterface {
    title: string;
    subject: string;
    scheduledAt?: Date;
    content: BlockInputInterface;
}

export class CampaignInputFactory {
    static create({ CampaignContentBlock }: { CampaignContentBlock: Block }): Type<CampaignInputInterface> {
        @InputType()
        class CampaignInput implements CampaignInputInterface {
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

            @Field(() => RootBlockInputScalar(CampaignContentBlock))
            @Transform(({ value }) => (isBlockInputInterface(value) ? value : CampaignContentBlock.blockInputFactory(value)), { toClassOnly: true })
            @ValidateNested()
            content: BlockInputInterface;
        }

        return CampaignInput;
    }
}
