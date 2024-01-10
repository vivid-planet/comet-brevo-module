import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { BrevoContactFilter } from "./brevo-contact.filter";
import { BrevoContactSort } from "./brevo-contact.sort";

@ArgsType()
export class BrevoContactsArgs extends OffsetBasedPaginationArgs {
    @Field(() => BrevoContactFilter, { nullable: true })
    @ValidateNested()
    @Type(() => BrevoContactFilter)
    @IsOptional()
    filter?: BrevoContactFilter;

    @Field(() => [BrevoContactSort], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => BrevoContactSort)
    @IsOptional()
    sort?: BrevoContactSort[];
}
