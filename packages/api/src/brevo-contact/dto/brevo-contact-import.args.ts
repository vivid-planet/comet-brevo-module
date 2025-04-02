import { IsUndefinable } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoContactImportArgsInterface {
    scope: EmailCampaignScopeInterface;
    fileId: string;
    targetGroupIds?: Array<string>;
}

export class BrevoContactImportArgsFactory {
    static create({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }) {
        @ArgsType()
        class BrevoContactImportArgs {
            @Field(() => ID)
            @IsUUID()
            fileId: string;

            @Field(() => [ID], { nullable: true })
            @IsUndefinable()
            targetGroupIds?: Array<string>;

            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: EmailCampaignScopeInterface;

            @Field()
            @IsBoolean()
            sendDoubleOptIn: boolean;

            @IsNotEmpty()
            @IsString()
            @Field()
            responsibleUserId: string;
        }

        return BrevoContactImportArgs;
    }
}
