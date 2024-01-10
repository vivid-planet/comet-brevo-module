import { CrudGenerator } from "@comet/cms-api";
import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Field, Int } from "@nestjs/graphql";

@Entity()
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
export class BrevoContact extends BaseEntity<BrevoContact, "id"> {
    @PrimaryKey()
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
