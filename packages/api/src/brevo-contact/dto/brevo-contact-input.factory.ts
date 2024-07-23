import { IsUndefinable } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TypeTransformer } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";

import { BrevoContactAttributesInterface } from "../../types";
import { IsValidRedirectURL } from "../validator/redirect-url.validator";

export interface BrevoContactInputInterface {
    email: string;
    blocked?: boolean;
    attributes?: BrevoContactAttributesInterface;
    redirectionUrl: string;
}

export interface BrevoContactUpdateInputInterface {
    blocked?: boolean;
    attributes?: BrevoContactAttributesInterface;
}

export class BrevoContactInputFactory {
    static create({
        BrevoContactAttributes,
    }: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
    }): [Type<BrevoContactInputInterface>, Type<Partial<BrevoContactUpdateInputInterface>>] {
        @InputType({
            isAbstract: true,
        })
        class BrevoContactInputBase implements BrevoContactInputInterface {
            @IsNotEmpty()
            @IsString()
            @Field()
            email: string;

            @IsBoolean()
            @Field()
            @IsOptional()
            blocked?: boolean;

            @Field()
            @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
            @IsValidRedirectURL()
            redirectionUrl: string;
        }

        @InputType({
            isAbstract: true,
        })
        class BrevoContactUpdateInputBase implements BrevoContactUpdateInputInterface {
            @IsBoolean()
            @Field()
            @IsOptional()
            blocked?: boolean;
        }

        if (BrevoContactAttributes) {
            @InputType()
            class BrevoContactInput extends BrevoContactInputBase {
                @Field(() => BrevoContactAttributes, { nullable: true })
                @TypeTransformer(() => BrevoContactAttributes)
                @ValidateNested()
                @IsUndefinable()
                attributes?: BrevoContactAttributesInterface;
            }

            @InputType()
            class BrevoContactUpdateInput extends BrevoContactUpdateInputBase {
                @Field(() => BrevoContactAttributes, { nullable: true })
                @TypeTransformer(() => BrevoContactAttributes)
                @ValidateNested()
                @IsUndefinable()
                attributes?: BrevoContactAttributesInterface;
            }

            return [BrevoContactInput, BrevoContactUpdateInput];
        }

        @InputType()
        class BrevoContactInput extends BrevoContactInputBase {}

        @InputType()
        class BrevoContactUpdateInput extends BrevoContactUpdateInputBase {}

        return [BrevoContactInput, BrevoContactUpdateInput];
    }
}
