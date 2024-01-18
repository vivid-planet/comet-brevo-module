import { Embeddable, Property } from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@Embeddable()
@ObjectType()
@InputType("CampaignContentScopeInput")
export class CampaignContentScope {
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    language: string;
}
