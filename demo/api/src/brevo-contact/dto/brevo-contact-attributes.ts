import { IsUndefinable } from "@comet/cms-api";
import { Embeddable, Enum } from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { BrevoContactSalutation } from "./brevo-contact.enums";

@ObjectType()
@InputType("BrevoContactAttributesInput")
export class BrevoContactAttributes {
    @IsNotEmpty()
    @IsString()
    @Field()
    LASTNAME: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    FIRSTNAME: string;

    @Field(() => BrevoContactSalutation, { nullable: true })
    @IsEnum(BrevoContactSalutation)
    @IsUndefinable()
    SALUTATION?: BrevoContactSalutation;
}

@Embeddable()
@ObjectType()
@InputType("BrevoContactFilterAttributesInput")
export class BrevoContactFilterAttributes {
    // index signature to match Array<any> | undefined in BrevoContactFilterAttributesInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Array<any> | undefined;

    @Field(() => [BrevoContactSalutation], { nullable: true })
    @IsEnum(BrevoContactSalutation, { each: true })
    @Enum({ items: () => BrevoContactSalutation, array: true })
    @IsUndefinable()
    SALUTATION?: BrevoContactSalutation[];
}
