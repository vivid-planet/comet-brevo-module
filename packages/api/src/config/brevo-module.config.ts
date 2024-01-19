import { Block } from "@comet/blocks-api";
import { Type } from "@nestjs/common";

import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";

export interface BrevoModuleConfig {
    brevo: {
        apiKey: string;
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        doubleOptInTemplateId: number;
        allowedRedirectUrl: string;
        sender: {
            name: string;
            email: string;
        };
    };
    ecgRtrList: {
        apiKey: string;
    };
    Scope: Type<EmailCampaignScopeInterface>;
    EmailCampaignContentBlock: Block;
}
