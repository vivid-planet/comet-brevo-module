import { registerEnumType } from "@nestjs/graphql";

export enum BrevoContactSalutation {
    MALE = "MALE",
    FEMALE = "FEMALE",
}

registerEnumType(BrevoContactSalutation, {
    name: "BrevoContactSalutation",
});
