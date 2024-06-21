import { registerEnumType } from "@nestjs/graphql";

export enum SendingState {
    DRAFT = "DRAFT",
    SENT = "SENT",
    SENDING = "SENDING",
    SCHEDULED = "SCHEDULED",
}

registerEnumType(SendingState, {
    name: "SendingState",
});
