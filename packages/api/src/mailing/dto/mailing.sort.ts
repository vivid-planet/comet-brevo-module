import { SortDirection } from "@comet/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum MailingSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    title = "title",
    subject = "subject",
    scheduledAt = "scheduledAt",
}
registerEnumType(MailingSortField, {
    name: "MailingSortField",
});

@InputType()
export class MailingSort {
    @Field(() => MailingSortField)
    @IsEnum(MailingSortField)
    field: MailingSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
