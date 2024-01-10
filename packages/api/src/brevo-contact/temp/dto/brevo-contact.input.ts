import { PartialType } from "@comet/cms-api";
import { InputType } from "@nestjs/graphql";

@InputType()
export class BrevoContactInput {}

@InputType()
export class BrevoContactUpdateInput extends PartialType(BrevoContactInput) {}
