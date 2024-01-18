import { Block } from "@comet/blocks-api";
import { Type } from "@nestjs/common";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactFilterAttributesInterface } from "../types";

export interface BrevoModuleConfig {
    brevo: {
        apiKey: string;
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        BrevoContactFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
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
