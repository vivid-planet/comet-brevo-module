import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { CampaignScopeInterface } from "../../types";
import { CampaignFilter } from "./campaign.filter";
import { CampaignSort } from "./campaign.sort";

export interface PaginatedCampaignsArgsInterface extends OffsetBasedPaginationArgs {
    scope: CampaignScopeInterface;
    search?: string;
    filter?: CampaignFilter;
    sort?: CampaignFilter[];
}

export class CampaignArgsFactory {
    static create({ Scope }: { Scope: Type<CampaignScopeInterface> }) {
        @ArgsType()
        class CampaignArgs extends OffsetBasedPaginationArgs {
            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: CampaignScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            search?: string;

            @Field(() => CampaignFilter, { nullable: true })
            @ValidateNested()
            @TransformerType(() => CampaignFilter)
            @IsOptional()
            filter?: CampaignFilter;

            @Field(() => [CampaignSort], { nullable: true })
            @ValidateNested({ each: true })
            @TransformerType(() => CampaignSort)
            @IsOptional()
            sort?: CampaignSort[];
        }

        return CampaignArgs;
    }
}
