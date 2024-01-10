import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, Min } from "class-validator";

@ArgsType()
export class BrevoUpdateContactArgs {
    @Field(() => Int)
    @IsInt()
    @Min(0)
    id: number;

    @Field(() => Boolean)
    @IsBoolean()
    blocked: boolean;
}
