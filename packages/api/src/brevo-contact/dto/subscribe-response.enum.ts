import { registerEnumType } from "@nestjs/graphql";

export enum SubscribeResponse {
    SUCCESSFUL = "SUCCESSFUL",
    ERROR_UNKNOWN = "ERROR_UNKNOWN",
    ERROR_CONTAINED_IN_ECG_RTR_LIST = "ERROR_CONTAINED_IN_ECG_RTR_LIST",
}

registerEnumType(SubscribeResponse, {
    name: "SubscribeResponse",
});
