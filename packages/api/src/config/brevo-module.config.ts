import { BrevoContactAttributesInterface } from "src/types";

export interface BrevoModuleConfig {
    brevo: {
        apiKey: string;
        BrevoContactAttributes?: BrevoContactAttributesInterface;
        doubleOptInTemplateId: number;
        allowedRedirectUrl: string;
    };
    ecgRtrList: {
        apiKey: string;
    };
}
