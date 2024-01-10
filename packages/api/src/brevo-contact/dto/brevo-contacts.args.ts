import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ArgsType()
export class BrevoContactsArgs extends OffsetBasedPaginationArgs {
    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;

    @Field(() => ID, { nullable: true })
    @IsString()
    @IsOptional()
    contactListId?: string;
}
