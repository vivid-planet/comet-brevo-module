import { DocumentInterface } from "@comet/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoConfigInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";
    id: string;
    senderName: string;
    senderMail: string;
    doubleOptInTemplateId: number;
    createdAt: Date;
    updatedAt: Date;
    scope: EmailCampaignScopeInterface;
}

export class BrevoConfigEntityFactory {
    static create({ Scope }: { Scope: EmailCampaignScopeInterface }): Type<BrevoConfigInterface> {
        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class BrevoConfig implements BrevoConfigInterface, DocumentInterface {
            [OptionalProps]?: "createdAt" | "updatedAt";

            @PrimaryKey({ columnType: "uuid" })
            @Field(() => ID)
            id: string = v4();

            @Property({ columnType: "text" })
            @Field()
            senderMail: string;

            @Property({ columnType: "text" })
            @Field()
            senderName: string;

            @Property({ columnType: "number" })
            @Field(() => Int)
            doubleOptInTemplateId: number;

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

        return BrevoConfig;
    }
}
