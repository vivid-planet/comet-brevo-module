import { SortDirection } from "@comet/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum BrevoContactSortField {
    id = "id",
}
registerEnumType(BrevoContactSortField, {
    name: "BrevoContactSortField",
});

@InputType()
export class BrevoContactSort {
    @Field(() => BrevoContactSortField)
    @IsEnum(BrevoContactSortField)
    field: BrevoContactSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
