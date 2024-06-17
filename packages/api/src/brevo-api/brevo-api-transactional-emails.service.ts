import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiEmailTemplateList } from "./dto/brevo-api-email-templates-list";

@Injectable()
export class BrevoApiTransactionalEmailsApiService {
    private readonly transactionalEmailsApi: SibApiV3Sdk.TransactionalEmailsApi;

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {
        this.transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    private async getBrevoApiKeyForScope(scope: EmailCampaignScopeInterface): Promise<string> {
        const data = await this.brevoConfigRepository.findOneOrFail({ scope: scope });

        if (!data.apiKey) {
            throw new Error("No api key found for scope");
        }

        return data.apiKey;
    }

    private async setApiKey({ scope }: { scope: EmailCampaignScopeInterface }): Promise<void> {
        const apiKey = await this.getBrevoApiKeyForScope(scope);
        this.transactionalEmailsApi.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    }

    public async getEmailTemplates(scope: EmailCampaignScopeInterface): Promise<BrevoApiEmailTemplateList> {
        await this.setApiKey({ scope });

        const { response, body } = await this.transactionalEmailsApi.getSmtpTemplates(true);

        if (response.statusCode !== 200) {
            throw new Error("Failed to get templates");
        }

        return body as BrevoApiEmailTemplateList;
    }
}
