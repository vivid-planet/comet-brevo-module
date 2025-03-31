import { Block } from "@comet/blocks-api";
import { Type } from "@nestjs/common";
import { BlacklistedContactsInterface } from "src/blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import { BrevoContactLogInterface } from "src/brevo-contact-log/entity/brevo-contact-log.entity.factory";
import { EmailCampaignInterface } from "src/email-campaign/entities/email-campaign-entity.factory";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactFilterAttributesInterface } from "../types";

export interface BrevoModuleConfig {
    brevo: {
        resolveConfig: (scope: EmailCampaignScopeInterface) => {
            apiKey: string;
            redirectUrlForImport: string;
        };
        BlacklistedContacts: Type<BlacklistedContactsInterface>;
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        BrevoContactFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
        EmailCampaign: Type<EmailCampaignInterface>;
        TargetGroup: Type<TargetGroupInterface>;
        BrevoContactLog: Type<BrevoContactLogInterface>;
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
    encryptionKey: string;
}
