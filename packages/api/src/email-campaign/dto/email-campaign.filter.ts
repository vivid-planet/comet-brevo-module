import { DateTimeFilter, StringFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class EmailCampaignFilter {
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;

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

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    scheduledAt?: DateTimeFilter;

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
