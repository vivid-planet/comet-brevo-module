import { BrevoContactAttributesInterface } from "src/types";

export interface BrevoModuleConfig {
    brevo: {
        apiKey: string;
        BrevoContactAttributes?: BrevoContactAttributesInterface;
        templateDoubleOptIn: number;
        allowedRedirectUrl: string;
    };
    ecgRtrList: {
        apiKey: string;
    };
}
