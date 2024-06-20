import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoContactsArgsInterface extends OffsetBasedPaginationArgs {
    scope: EmailCampaignScopeInterface;
    email?: string;
}

export class BrevoContactsArgsFactory {
    static create({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }) {
        @ArgsType()
        class BrevoContactsArgs extends OffsetBasedPaginationArgs {
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
