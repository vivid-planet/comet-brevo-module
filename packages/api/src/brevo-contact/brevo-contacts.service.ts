import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";
import { PaginatedBrevoContacts } from "./dto/paginated-brevo-contact";

@Injectable()
export class BrevoContactsService {
    constructor(private readonly brevoContactsApiService: BrevoApiContactsService) {}

    public async findContacts({ email, ...args }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
        // TODO: add correct lists when brevo contact list is implemented
        // 2 is the id of the first list in brevo that is created by default
        const contactListId = 2;
        if (email) {
            const contact = await this.brevoContactsApiService.getContactInfoByEmail(email);
            if (contact) {
                return new PaginatedBrevoContacts([contact], 1, args);
            }
            return new PaginatedBrevoContacts([], 0, args);
        }

        const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(contactListId, args.limit, args.offset);
        return new PaginatedBrevoContacts(contacts, count, args);
    }
}
