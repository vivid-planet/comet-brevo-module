import { Injectable } from "@nestjs/common";

import { CreateDoubleOptInContactData } from "../brevo/brevo-contact.service";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";

@Injectable()
export class BrevoContactService {
    public async findContacts({ contactListId, email, ...args }: BrevoContactsArgs): Promise<true> {
        return true;
        // const where: FilterQuery<NewsletterContactList> = { scope, isMainList: true };
        // if (contactListId) {
        //     where.id = contactListId;
        //     where.isMainList = false;
        // }
        // let contactList = await this.contactListRepository.findOne(where);
        // if (!contactList) {
        //     // When querying for a specific contact list, throw an error if it does not exist
        //     if (contactListId) {
        //         throw new NotFoundError("Contact list not found");
        //     }
        //     // when there is no contact list for the scope, create one as the default
        //     contactList = await this.contactListService.create(scope, { title: "Main" }, true);
        // }
        // if (email) {
        //     const contact = isEmail(email) ? await this.brevoContactService.getContactInfoForMail(email) : null;
        //     if (contact) {
        //         return new PaginatedNewsletterContact([contact], 1, args);
        //     }
        //     return new PaginatedNewsletterContact([], 0, args);
        // } else {
        //     const [contacts, count] = await this.brevoContactService.findContactsByListId(contactList.brevoId, args.limit, args.offset);
        //     return new PaginatedNewsletterContact(contacts, count, args);
        // }
    }

    public async createDoubleOptInContact(data: CreateDoubleOptInContactData, templateId: number): Promise<boolean> {
        return true;
        // let mainList = await this.contactListRepository.findOne({ scope: data.scope, isMainList: true });
        // if (!mainList) {
        //     mainList = await this.contactListService.create(data.scope, { title: "Main" }, true);
        // }
        // const mainListId = mainList.brevoId;
        // let offset = 0;
        // let totalCount = 0;
        // const targetGroupIds: number[] = [];
        // const limit = 50;
        // do {
        //     const [targetGroups, totalContactLists] = await this.contactListRepository.findAndCount(
        //         {
        //             isMainList: false,
        //         },
        //         { limit, offset },
        //     );
        //     totalCount = totalContactLists;
        //     offset += targetGroups.length;
        // } while (offset < totalCount);
        // const created = await this.brevoContactService.createDoubleOptInContact(data, [mainListId, ...targetGroupIds], templateId);
        // if (created) {
        //     return SubscribeNewsletterResponse.SUCCESSFUL;
        // }
        // return SubscribeNewsletterResponse.ERROR_UNKNOWN;
    }
}
