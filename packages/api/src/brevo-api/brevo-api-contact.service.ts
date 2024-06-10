import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoContactAttributesInterface } from "src/types";

import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupInputInterface } from "../target-group/dto/target-group-input.factory";
import { isErrorFromBrevo } from "./brevo-api.utils";
import { BrevoApiContactList } from "./dto/brevo-api-contact-list";

export interface CreateDoubleOptInContactData {
    email: string;
    attributes?: BrevoContactAttributesInterface;
    redirectionUrl: string;
}

@Injectable()
export class BrevoApiContactsService {
    private readonly contactsApi: SibApiV3Sdk.ContactsApi;

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {
        this.contactsApi = new SibApiV3Sdk.ContactsApi();
        this.contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, config.brevo.apiKey);
    }

    public async createDoubleOptInBrevoContact(
        { email, redirectionUrl, attributes }: CreateDoubleOptInContactData,
        brevoIds: number[],
        templateId: number,
    ): Promise<boolean> {
        const contact = {
            email,
            includeListIds: brevoIds,
            templateId,
            redirectionUrl,
            attributes,
        };
        const { response } = await this.contactsApi.createDoiContact(contact);

        return response.statusCode === 204 || response.statusCode === 201;
    }

    public async updateContact(
        id: number,
        {
            blocked,
            attributes,
            listIds,
            unlinkListIds,
        }: { blocked?: boolean; attributes?: BrevoContactAttributesInterface; listIds?: number[]; unlinkListIds?: number[] },
    ): Promise<BrevoContactInterface> {
        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        await this.contactsApi.updateContact(idAsString, { emailBlacklisted: blocked, attributes, listIds, unlinkListIds });
        return this.findContact(id);
    }

    public async updateMultipleContacts(contacts: SibApiV3Sdk.UpdateBatchContactsContacts[]): Promise<boolean> {
        const { response } = await this.contactsApi.updateBatchContacts({ contacts });
        return response.statusCode === 204;
    }

    public async deleteContact(id: number): Promise<boolean> {
        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        const { response } = await this.contactsApi.deleteContact(idAsString);

        return response.statusCode === 204;
    }

    public async findContact(id: number): Promise<BrevoContactInterface> {
        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        const { body } = await this.contactsApi.getContactInfo(idAsString);

        return body;
    }

    public async getContactInfoByEmail(email: string): Promise<BrevoContactInterface | undefined> {
        try {
            const data = await this.contactsApi.getContactInfo(email);
            const contact = data.body;
            if (!contact) return undefined;
            return contact;
        } catch (error) {
            // Brevo throws 400 error if no contact was found
            if (isErrorFromBrevo(error) && error.response.statusCode === 400) {
                return undefined;
            }
            throw error;
        }
    }

    public async findContactsByListId(id: number, limit: number, offset: number): Promise<[BrevoContactInterface[], number]> {
        const data = await this.contactsApi.getContactsFromList(id, undefined, limit, offset);

        return [data.body.contacts, data.body.count];
    }

    public async blacklistMultipleContacts(emails: string[]): Promise<void> {
        const blacklistedContacts = emails.map((email) => ({ email, emailBlacklisted: true }));

        await this.contactsApi.updateBatchContacts({ contacts: blacklistedContacts });
    }

    public async createBrevoContactList(input: TargetGroupInputInterface): Promise<number | undefined> {
        const contactList = {
            name: input.title,
            folderId: 1, // folderId is required, folder #1 is created by default
        };

        const data = await this.contactsApi.createList(contactList);
        return data.body.id;
    }

    public async updateBrevoContactList(id: number, title: string): Promise<boolean> {
        const data = await this.contactsApi.updateList(id, { name: title });
        return data.response.statusCode === 204;
    }

    public async deleteBrevoContactList(id: number): Promise<boolean> {
        const data = await this.contactsApi.deleteList(id);
        return data.response.statusCode === 204;
    }

    public async findBrevoContactListById(id: number): Promise<BrevoApiContactList> {
        const data = await this.contactsApi.getList(id);
        return data.body;
    }

    public async findBrevoContactListsByIds(ids: number[]): Promise<BrevoApiContactList[]> {
        const lists: BrevoApiContactList[] = [];
        for await (const list of await this.getBrevoContactListResponses()) {
            if (ids.includes(list.id)) {
                lists.push(list);
            }
        }

        return lists;
    }

    async *getBrevoContactListResponses(): AsyncGenerator<BrevoApiContactList, void, undefined> {
        const limit = 50;
        let offset = 0;

        while (true) {
            const listsResponse = await this.contactsApi.getLists(limit, offset);
            const lists = listsResponse.body.lists ?? [];

            if (lists.length === 0) {
                break;
            }
            yield* lists;

            offset += limit;
        }
    }
}
