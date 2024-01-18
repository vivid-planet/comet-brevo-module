import { IsUndefinable } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TypeTransformer } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

import { BrevoContactFilterAttributesInterface } from "../../types";

export interface TargetGroupInputInterface {
    title: string;
    filters?: BrevoContactFilterAttributesInterface;
}

export class TargetGroupInputFactory {
    static create({
        BrevoFilterAttributes,
    }: {
        BrevoFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
    }): Type<TargetGroupInputInterface> {
        @InputType({
            isAbstract: true,
        })
        class TargetGroupInputBase implements TargetGroupInputInterface {
            @IsNotEmpty()
            @IsString()
            @Field()
            title: string;
        }

        if (BrevoFilterAttributes) {
            @InputType()
            class TargetGroupInput extends TargetGroupInputBase {
                @Field(() => BrevoFilterAttributes, { nullable: true })
                @TypeTransformer(() => BrevoFilterAttributes)
                @ValidateNested()
                @IsUndefinable()
                filters?: BrevoContactFilterAttributesInterface;
            }

            return TargetGroupInput;
        }

        @InputType()
        class TargetGroupInput extends TargetGroupInputBase {}

        return TargetGroupInput;
    }
}
