import { BooleanFilter, DateFilter, StringFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class TargetGroupFilter {
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

    @Field(() => BooleanFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => BooleanFilter)
    isTestList?: BooleanFilter;

    @Field(() => [TargetGroupFilter], { nullable: true })
    @Type(() => TargetGroupFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: TargetGroupFilter[];

    @Field(() => [TargetGroupFilter], { nullable: true })
    @Type(() => TargetGroupFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: TargetGroupFilter[];
}
