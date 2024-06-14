import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiEmailTemplateList } from "./dto/brevo-api-email-templates-list";

@Injectable()
export class BrevoApiTransactionalEmailsApiService {
    private readonly transactionalEmailsApi: SibApiV3Sdk.TransactionalEmailsApi;

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {
        this.transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
        this.transactionalEmailsApi.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, config.brevo.apiKey);
    }

    public async getEmailTemplates(): Promise<BrevoApiEmailTemplateList> {
        const { response, body } = await this.transactionalEmailsApi.getSmtpTemplates(true);

        if (response.statusCode !== 200) {
            throw new Error("Failed to get templates");
        }

        return body as BrevoApiEmailTemplateList;
    }
}
