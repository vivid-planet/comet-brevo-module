import { CrudField, CrudGenerator, DocumentInterface } from "@comet/cms-api";
import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";

import { SendingState } from "../subscribe-newsletter-response.enum";

@Entity()
@ObjectType({
    implements: () => [DocumentInterface],
})
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
export class Mailing implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "sendingState";

    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    @CrudField({
        search: false,
        filter: false,
        sort: false,
        input: false,
    })
    id: string = v4();

    @Property({ columnType: "timestamp with time zone" })
    @Field(() => Date)
    @CrudField({
        search: false,
        input: false,
    })
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field(() => Date)
    @CrudField({
        search: false,
        input: false,
    })
    updatedAt: Date = new Date();

    @Property({ columnType: "text" })
    @Field()
    title: string;

    @Property({ columnType: "text" })
    @Field()
    subject: string;

    @Property({ columnType: "int", nullable: true })
    @Field(() => Int, { nullable: true })
    @CrudField({
        search: false,
        filter: false,
        input: false,
        sort: false,
    })
    brevoId?: number;

    // TODO: add contact list

    // TODO: add content

    // TODO: add scope

    @CrudField({
        search: false,
        filter: false,
        input: false,
        sort: false,
        resolveField: false,
    })
    @Field(() => SendingState)
    sendingState: SendingState;

    @Property({ columnType: "timestamp with time zone", nullable: true })
    @Field(() => Date, { nullable: true })
    @CrudField({
        search: false,
    })
    scheduledAt?: Date;
}
