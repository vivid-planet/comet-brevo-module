import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@ArgsType()
export class AssignedBrevoContactsArgs extends OffsetBasedPaginationArgs {
    @Field(() => ID)
    @IsString()
    targetGroupId: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;

    @Field(() => Boolean, { nullable: true })
    @IsNumber()
    @IsOptional()
    onlyManuallyAssigned?: boolean;
}
