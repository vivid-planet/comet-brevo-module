import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean } from "class-validator";

@InputType()
export class BrevoContactUpdateInput {
    @Field(() => Boolean)
    @IsBoolean()
    blocked: boolean;
}
