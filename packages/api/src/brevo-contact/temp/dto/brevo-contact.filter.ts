import { NumberFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class BrevoContactFilter {
    @Field(() => NumberFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NumberFilter)
    id?: NumberFilter;

    @Field(() => [BrevoContactFilter], { nullable: true })
    @Type(() => BrevoContactFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: BrevoContactFilter[];

    @Field(() => [BrevoContactFilter], { nullable: true })
    @Type(() => BrevoContactFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: BrevoContactFilter[];
}
