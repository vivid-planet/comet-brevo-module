import { Embeddable } from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { BrevoContactFilterAttributesInterface } from "src/types";

@Embeddable()
@ObjectType()
@InputType("BrevoContactFilterAttributesInput")
export class EmptyBrevoContactFilterAttributes implements BrevoContactFilterAttributesInterface {
    // index signature to match Array<any> | undefined in BrevoContactFilterAttributesInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Array<any> | undefined;

    @Field(() => [String], { nullable: true })
    thisFilterHasNoFields____?: string[]; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
