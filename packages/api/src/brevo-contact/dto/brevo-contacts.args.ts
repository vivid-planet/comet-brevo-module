import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@ArgsType()
export class BrevoContactsArgs extends OffsetBasedPaginationArgs {
    // TODO: add scope

    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;
}
