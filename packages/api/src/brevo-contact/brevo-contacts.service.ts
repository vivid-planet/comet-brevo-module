import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService, CreateDoubleOptInContactData} from "../brevo-api/brevo-api-contact.service";
import { SubscribeResponse } from "./dto/subscribe-response.enum";

@Injectable()
export class BrevoContactsService {
    constructor(private readonly brevoContactsApiService: BrevoApiContactsService) {}


    public async createDoubleOptInContact(data: CreateDoubleOptInContactData, templateId: number): Promise<SubscribeResponse> {
        const contactListId = 2;

        const created = await this.brevoContactsApiService.createDoubleOptInContact(data, [contactListId], templateId);
        if (created) {
            return SubscribeResponse.SUCCESSFUL;
        }
        return SubscribeResponse.ERROR_UNKNOWN;
    }
}
