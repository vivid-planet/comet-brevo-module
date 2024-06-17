import { Block } from "@comet/blocks-api";
import { Type } from "@nestjs/common";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactFilterAttributesInterface } from "../types";

export interface BrevoModuleConfig {
    brevo: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        BrevoContactFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
        allowedRedirectUrl: string;
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
