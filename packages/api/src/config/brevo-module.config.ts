import { Type } from "@nestjs/common";
import { BrevoContactAttributesInterface } from "src/types";

export interface BrevoModuleConfig {
    brevo: {
        apiKey: string;
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        doubleOptInTemplateId: number;
        allowedRedirectUrl: string;
    };
    ecgRtrList: {
        apiKey: string;
    };
}
