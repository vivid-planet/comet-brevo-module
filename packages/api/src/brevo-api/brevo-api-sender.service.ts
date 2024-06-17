import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiSender } from "./dto/brevo-api-sender";

@Injectable()
export class BrevoApiSenderService {
    private readonly senderApi: SibApiV3Sdk.SendersApi;

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {
        this.senderApi = new SibApiV3Sdk.SendersApi();
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
        this.senderApi.setApiKey(SibApiV3Sdk.SendersApiApiKeys.apiKey, apiKey);
    }

    public async getSenders(scope: EmailCampaignScopeInterface): Promise<Array<BrevoApiSender> | undefined> {
        await this.setApiKey({ scope });

        const { response, body } = await this.senderApi.getSenders();

        if (response.statusCode !== 200) {
            throw new Error("Failed to get senders");
        }

        return body.senders as BrevoApiSender[];
    }
}
