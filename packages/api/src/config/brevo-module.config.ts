export interface BrevoModuleConfig {
    api: {
        brevo: {
            apiKey: string;
            templateDoubleOptIn: number;
            allowedRedirectUrl: string;
        };
        ecgRtrList: {
            apiKey: string;
        };
    };
}
