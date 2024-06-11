import { IsUndefinable, PartialType } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TypeTransformer } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

import { BrevoContactAttributesInterface } from "../../types";

export interface BrevoContactInputInterface {
    email: string;
    blocked?: boolean;
    attributes?: BrevoContactAttributesInterface;
}

export class BrevoContactInputFactory {
    static create({
        BrevoContactAttributes,
    }: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
    }): [Type<BrevoContactInputInterface>, Type<Partial<BrevoContactInputInterface>>] {
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
            class BrevoContactUpdateInput extends PartialType(BrevoContactInput) {}

            return [BrevoContactInput, BrevoContactUpdateInput];
        }

        @InputType()
        class BrevoContactInput extends BrevoContactInputBase {}

        @InputType()
        class BrevoContactUpdateInput extends PartialType(BrevoContactInput) {}

        return [BrevoContactInput, BrevoContactUpdateInput];
    }
}
