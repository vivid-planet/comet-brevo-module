import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { MailingScopeInterface } from "src/types";

import { MailingFilter } from "./mailing.filter";
import { MailingSort } from "./mailing.sort";

export interface PaginatedMailingsArgsInterface extends OffsetBasedPaginationArgs {
    scope: MailingScopeInterface;
    search?: string;
    filter?: MailingFilter;
    sort?: MailingFilter[];
}

export class MailingArgsFactory {
    static create({ Scope }: { Scope: Type<MailingScopeInterface> }) {
        @ArgsType()
        class MailingArgs extends OffsetBasedPaginationArgs {
            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: MailingScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            search?: string;

            @Field(() => MailingFilter, { nullable: true })
            @ValidateNested()
            @TransformerType(() => MailingFilter)
            @IsOptional()
            filter?: MailingFilter;

            @Field(() => [MailingSort], { nullable: true })
            @ValidateNested({ each: true })
            @TransformerType(() => MailingSort)
            @IsOptional()
            sort?: MailingSort[];
        }

        return MailingArgs;
    }
}
