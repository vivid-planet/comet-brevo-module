import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BrevoContact {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    createdAt: string;

    @Field(() => String)
    modifiedAt: string;

    @Field(() => String)
    email: string;

    @Field(() => Boolean)
    emailBlacklisted: boolean;

    @Field(() => Boolean)
    smsBlacklisted: boolean;

    @Field(() => [Number])
    listIds: number[];

    @Field(() => [Number])
    listUnsubscribed?: number[];

    @Field(() => String, { nullable: true })
    firstName?: string;

    @Field(() => String, { nullable: true })
    lastName?: string;
}
