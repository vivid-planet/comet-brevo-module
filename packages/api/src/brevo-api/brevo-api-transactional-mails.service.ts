import * as Brevo from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";

type SendTransacEmailResponse = ReturnType<Brevo.TransactionalEmailsApi["sendTransacEmail"]>;

@Injectable()
export class BrevoTransactionalMailsService {
    private readonly transactionalEmailsApi = new Map<string, Brevo.TransactionalEmailsApi>();

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    private getTransactionalEmailsApi(scope: EmailCampaignScopeInterface): Brevo.TransactionalEmailsApi {
        const existingTransactionalEmailsApiForScope = this.transactionalEmailsApi.get(JSON.stringify(scope));

        if (existingTransactionalEmailsApiForScope) {
            return existingTransactionalEmailsApiForScope;
        }

        const { apiKey } = this.config.brevo.resolveConfig(scope);
        const transactionalEmailApi = new Brevo.TransactionalEmailsApi();
        transactionalEmailApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

        this.transactionalEmailsApi.set(JSON.stringify(scope), transactionalEmailApi);

        return transactionalEmailApi;
    }

    async send(options: Omit<Brevo.SendSmtpEmail, "sender">, scope: EmailCampaignScopeInterface): SendTransacEmailResponse {
        const config = this.config.brevo.resolveConfig(scope);
        return this.getTransactionalEmailsApi(scope).sendTransacEmail({ ...options, sender: config.sender });
    }
}
