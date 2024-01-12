import { DateFilter, StringFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class MailingFilter {
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

    @Field(() => [MailingFilter], { nullable: true })
    @Type(() => MailingFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: MailingFilter[];

    @Field(() => [MailingFilter], { nullable: true })
    @Type(() => MailingFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: MailingFilter[];
}
