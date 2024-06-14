import { Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";

@Injectable()
export class BrevoApiAccountService {
    private readonly accountApi: SibApiV3Sdk.AccountApi;

    constructor() {
        this.accountApi = new SibApiV3Sdk.AccountApi();
    }

    public async getAccountInformation({ apiKey }: { apiKey: string }): Promise<SibApiV3Sdk.GetAccount | undefined> {
        try {
            this.accountApi.setApiKey(SibApiV3Sdk.AccountApiApiKeys.apiKey, apiKey);
            const { response, body } = await this.accountApi.getAccount();

            if (response.statusCode !== 200) {
                return undefined;
            }

            return body;
        } catch {
            return undefined;
        }
    }
}
