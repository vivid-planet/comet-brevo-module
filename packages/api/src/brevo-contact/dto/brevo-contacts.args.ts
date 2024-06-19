import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoContactsArgsInterface extends OffsetBasedPaginationArgs {
    scope: EmailCampaignScopeInterface;
    targetGroupId?: string;
    email?: string;
}

export class BrevoContactsArgsFactory {
    static create({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }) {
        @ArgsType()
        class BrevoContactsArgs extends OffsetBasedPaginationArgs {
            @Field(() => ID, { nullable: true })
            @IsString()
            @IsOptional()
            targetGroupId?: string;

            @Field(() => Boolean, { nullable: true })
            @IsBoolean()
            @IsOptional()
            onlyShowAssignedContactsOfTargetGroup?: boolean;

            @Field(() => String, { nullable: true })
            @IsOptional()
            email?: string;

            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: EmailCampaignScopeInterface;
        }

        return BrevoContactsArgs;
    }
}
