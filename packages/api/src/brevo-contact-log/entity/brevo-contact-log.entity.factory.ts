import { DocumentInterface } from "@comet/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoContactLogInterface {
    email: string;
    userId: string;
    scope: EmailCampaignScopeInterface;
    createdAt: Date;
    updatedAt: Date;
}

export function createBrevoContactLogEntity({ Scope }: { Scope: EmailCampaignScopeInterface }): Type<BrevoContactLogInterface> {
    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoContactLog implements BrevoContactLogInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = v4();

        @Property({ columnType: "text" })
        @Field()
        email: string;

        @Property()
        @Field()
        userId: string;

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

        @Embedded(() => Scope)
        @Field(() => Scope)
        scope: typeof Scope;
    }

    return BrevoContactLog;
}
