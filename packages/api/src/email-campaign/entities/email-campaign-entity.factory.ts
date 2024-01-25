import { Block, BlockDataInterface, RootBlock } from "@comet/blocks-api";
import { DocumentInterface, RootBlockDataScalar, RootBlockType } from "@comet/cms-api";
import { Embedded, Entity, ManyToOne, OptionalProps, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";

import { TargetGroupInterface } from "../../target-group/entity/target-group-entity.factory";
import { EmailCampaignScopeInterface } from "../../types";
import { SendingState } from "../sending-state.enum";

export interface EmailCampaignInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "sendingState";
    id: string;
    createdAt: Date;
    scheduledAt?: Date;
    title: string;
    subject: string;
    brevoId?: number;
    updatedAt: Date;
    content: BlockDataInterface;
    scope: EmailCampaignScopeInterface;
    sendingState: SendingState;
    targetGroup?: Ref<TargetGroupInterface>;
}

export class EmailCampaignEntityFactory {
    static create({
        EmailCampaignContentBlock,
        Scope,
        TargetGroup,
    }: {
        EmailCampaignContentBlock: Block;
        Scope: EmailCampaignScopeInterface;
        TargetGroup: Type<TargetGroupInterface>;
    }): Type<EmailCampaignInterface> {
        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class EmailCampaign implements EmailCampaignInterface, DocumentInterface {
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

            @ManyToOne(() => TargetGroup, { nullable: true, ref: true })
            @Field(() => TargetGroup, { nullable: true })
            targetGroup?: Ref<TargetGroupInterface> = undefined;

            @RootBlock(EmailCampaignContentBlock)
            @Property({ customType: new RootBlockType(EmailCampaignContentBlock) })
            @Field(() => RootBlockDataScalar(EmailCampaignContentBlock))
            content: BlockDataInterface;

            @Embedded(() => Scope)
            @Field(() => Scope)
            scope: typeof Scope;
        }

        return EmailCampaign;
    }
}
