import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";

@ArgsType()
export class BrevoContactsInTargetGroupArgs extends OffsetBasedPaginationArgs {
    @Field(() => ID)
    @IsString()
    targetGroupId: string;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    onlyShowManuallyAssignedContacts?: boolean;

    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;
}
