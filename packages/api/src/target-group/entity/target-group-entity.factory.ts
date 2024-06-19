import { DocumentInterface } from "@comet/cms-api";
import { Embedded, Entity, OneToOne, OptionalProps, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";

import { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../../types";

export interface TargetGroupInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "totalSubscribers" | "totalContactsBlocked";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    isMainList: boolean;
    brevoId: number;
    totalSubscribers: number;
    totalContactsBlocked: number;
    scope: EmailCampaignScopeInterface;
    filters?: BrevoContactFilterAttributesInterface;
    assignedContactsTargetGroup?: Ref<TargetGroupInterface>;
    associatedTargetGroup?: Ref<TargetGroupInterface>;
}

export class TargetGroupEntityFactory {
    static create({
        Scope,
        BrevoFilterAttributes,
    }: {
        Scope: Type<EmailCampaignScopeInterface>;
        BrevoFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
    }): Type<TargetGroupInterface> {
        @Entity({ abstract: true })
        @ObjectType({
            implements: () => [DocumentInterface],
            isAbstract: true,
        })
        class TargetGroupBase implements TargetGroupInterface, DocumentInterface {
            [OptionalProps]?: "createdAt" | "updatedAt" | "totalSubscribers" | "totalContactsBlocked";

            @PrimaryKey({ columnType: "uuid" })
            @Field(() => ID)
            id: string = v4();

            @Property({ columnType: "timestamp with time zone" })
            @Field()
            createdAt: Date = new Date();

            @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
            @Field()
            updatedAt: Date = new Date();

            @Property({ columnType: "text" })
            @Field()
            title: string;

            @Property({ columnType: "boolean" })
            @Field()
            isMainList: boolean;

            @Property({ columnType: "int" })
            @Field(() => Int)
            brevoId: number;

            @Field(() => Int)
            totalSubscribers: number;

            @Field(() => Int)
            totalContactsBlocked: number;

            @Embedded(() => Scope)
            @Field(() => Scope)
            scope: typeof Scope;
        }
        if (BrevoFilterAttributes) {
            @Entity()
            @ObjectType({
                implements: () => [DocumentInterface],
            })
            class TargetGroup extends TargetGroupBase {
                @Field(() => TargetGroup, { nullable: true })
                @OneToOne(() => TargetGroup, (targetGroup) => targetGroup.associatedTargetGroup, {
                    onDelete: "cascade",
                    ref: true,
                    nullable: true,
                })
                assignedContactsTargetGroup?: Ref<TargetGroupInterface>;

                @Field(() => TargetGroup, { nullable: true })
                @OneToOne(() => TargetGroup, (targetGroup) => targetGroup.assignedContactsTargetGroup, {
                    onDelete: "cascade",
                    ref: true,
                    nullable: true,
                    owner: true,
                })
                associatedTargetGroup?: Ref<TargetGroupInterface>;

                @Embedded(() => BrevoFilterAttributes, { nullable: true })
                @Field(() => BrevoFilterAttributes, { nullable: true })
                filters?: BrevoContactFilterAttributesInterface;
            }

            return TargetGroup;
        }

        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class TargetGroup extends TargetGroupBase {
            @Field(() => TargetGroup, { nullable: true })
            @OneToOne(() => TargetGroup, (targetGroup) => targetGroup.associatedTargetGroup, {
                onDelete: "cascade",
                ref: true,
                nullable: true,
            })
            assignedContactsTargetGroup?: Ref<TargetGroupInterface>;

            @Field(() => TargetGroup, { nullable: true })
            @OneToOne(() => TargetGroup, (targetGroup) => targetGroup.assignedContactsTargetGroup, {
                onDelete: "cascade",
                ref: true,
                nullable: true,
            })
            associatedTargetGroup?: Ref<TargetGroupInterface>;
        }

        return TargetGroup;
    }
}
