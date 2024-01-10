import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@ArgsType()
export class BrevoContactsArgs extends OffsetBasedPaginationArgs {
    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;
}
