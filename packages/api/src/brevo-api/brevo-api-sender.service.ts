import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiSender } from "./dto/brevo-api-sender";

@Injectable()
export class BrevoApiSenderService {
    private readonly senderApi: SibApiV3Sdk.SendersApi;

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {
        this.senderApi = new SibApiV3Sdk.SendersApi();
        this.senderApi.setApiKey(SibApiV3Sdk.SendersApiApiKeys.apiKey, config.brevo.apiKey);
    }

    public async getSenders(): Promise<Array<SibApiV3Sdk.GetSendersListSenders> | undefined> {
        const { response, body } = await this.senderApi.getSenders();

        if (response.statusCode !== 200) {
            throw new Error("Failed to get senders");
        }

        return body.senders as BrevoApiSender[];
    }
}
