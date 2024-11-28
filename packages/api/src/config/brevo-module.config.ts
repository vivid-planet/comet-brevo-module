import { Block } from "@comet/blocks-api";
import { Type } from "@nestjs/common";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactFilterAttributesInterface } from "../types";

export interface BrevoModuleConfig {
    brevo: {
        resolveConfig: (scope: EmailCampaignScopeInterface) => {
            apiKey: string;
            doubleOptInTemplateId: number;
            sender: {
                name: string;
                email: string;
            };
            allowedRedirectUrl: string;
            redirectUrlForImport: string;
            folderId: number;
        };
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        BrevoContactFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
    };
    ecgRtrList: {
        apiKey: string;
    };
    emailCampaigns: {
        Scope: Type<EmailCampaignScopeInterface>;
        EmailCampaignContentBlock: Block;
        frontend: {
            url: string;
            basicAuth: {
                username: string;
                password: string;
            };
        };
    };
}
