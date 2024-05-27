import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BrevoApiSender {
    @Field(() => ID)
    id: number;

    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field(() => Boolean)
    active: boolean;

    // TODO: add ips
}
