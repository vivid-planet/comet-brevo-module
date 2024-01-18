import { SortDirection } from "@comet/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum CampaignSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    title = "title",
    subject = "subject",
    scheduledAt = "scheduledAt",
}
registerEnumType(CampaignSortField, {
    name: "CampaignSortField",
});

@InputType()
export class CampaignSort {
    @Field(() => CampaignSortField)
    @IsEnum(CampaignSortField)
    field: CampaignSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
