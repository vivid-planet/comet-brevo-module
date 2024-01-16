import { Block, BlockDataInterface, RootBlock } from "@comet/blocks-api";
import { DocumentInterface, RootBlockDataScalar, RootBlockType } from "@comet/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { MailingScopeInterface } from "src/types";
import { v4 } from "uuid";

import { SendingState } from "../sending-state.enum";

export interface MailingInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "sendingState";
    id: string;
    createdAt: Date;
    scheduledAt?: Date;
    title: string;
    subject: string;
    brevoId?: number;
    updatedAt: Date;
    content: BlockDataInterface;
    scope: MailingScopeInterface;
}

export class MailingEntityFactory {
    static create({ MailingContentBlock, Scope }: { MailingContentBlock: Block; Scope: MailingScopeInterface }): Type<MailingInterface> {
        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class Mailing implements MailingInterface, DocumentInterface {
            [OptionalProps]?: "createdAt" | "updatedAt" | "sendingState";
            @PrimaryKey({ columnType: "uuid" })
            @Field(() => ID)
            id: string = v4();

            @Property({
                columnType: "timestamp with time zone",
            })
            @Field()
            createdAt: Date = new Date();

            @Property({
                columnType: "timestamp with time zone",
                onUpdate: () => new Date(),
            })
            @Field()
            updatedAt: Date = new Date();

            @Property({ columnType: "text" })
            @Field()
            title: string;

            @Property({ columnType: "text" })
            @Field()
            subject: string;

            @Property({ columnType: "int", nullable: true })
            @Field(() => Int, { nullable: true })
            brevoId?: number;

            @Field(() => SendingState)
            sendingState: SendingState;

            @Property({ columnType: "timestamp with time zone", nullable: true })
            @Field(() => Date, { nullable: true })
            scheduledAt?: Date;

            @RootBlock(MailingContentBlock)
            @Property({ customType: new RootBlockType(MailingContentBlock) })
            @Field(() => RootBlockDataScalar(MailingContentBlock))
            content: BlockDataInterface;

            @Embedded(() => Scope)
            @Field(() => Scope)
            scope: typeof Scope;
        }

        return Mailing;
    }
}
