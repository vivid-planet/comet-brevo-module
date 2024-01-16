import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";

@Injectable()
export class BrevoContactsService {
    constructor(private readonly brevoContactsApiService: BrevoApiContactsService) {}

    // TODO: add functionality back here when brevo contact/target list is implemented
}
