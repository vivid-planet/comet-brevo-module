import { DateFilter, StringFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class EmailCampaignFilter {
    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    createdAt?: DateFilter;

    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    updatedAt?: DateFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    title?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    subject?: StringFilter;

    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    scheduledAt?: DateFilter;

    @Field(() => [EmailCampaignFilter], { nullable: true })
    @Type(() => EmailCampaignFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: EmailCampaignFilter[];

    @Field(() => [EmailCampaignFilter], { nullable: true })
    @Type(() => EmailCampaignFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: EmailCampaignFilter[];
}
