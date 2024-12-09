import * as Brevo from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { handleBrevoError, isErrorFromBrevo } from "./brevo-api.utils";
import { BrevoApiContactList } from "./dto/brevo-api-contact-list";

export interface CreateDoubleOptInContactData {
    email: string;
    attributes?: BrevoContactAttributesInterface;
    redirectionUrl: string;
}

@Injectable()
export class BrevoApiContactsService {
    private readonly contactsApis = new Map<string, Brevo.ContactsApi>();

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    private getContactsApi(scope: EmailCampaignScopeInterface): Brevo.ContactsApi {
        try {
            const existingContactsApiForScope = this.contactsApis.get(JSON.stringify(scope));

            if (existingContactsApiForScope) {
                return existingContactsApiForScope;
            }

            const { apiKey } = this.config.brevo.resolveConfig(scope);
            const contactsApi = new Brevo.ContactsApi();
            contactsApi.setApiKey(Brevo.ContactsApiApiKeys.apiKey, apiKey);

            this.contactsApis.set(JSON.stringify(scope), contactsApi);

            return contactsApi;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async createDoubleOptInBrevoContact(
        { email, redirectionUrl, attributes }: CreateDoubleOptInContactData,
        brevoIds: number[],
        templateId: number,
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        try {
            const contact = {
                email,
                includeListIds: brevoIds,
                templateId,
                redirectionUrl,
                attributes,
            };
            const { response } = await this.getContactsApi(scope).createDoiContact(contact);

            return response.statusCode === 204 || response.statusCode === 201;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateContact(
        id: number,
        {
            blocked,
            attributes,
            listIds,
            unlinkListIds,
        }: { blocked?: boolean; attributes?: BrevoContactAttributesInterface; listIds?: number[]; unlinkListIds?: number[] },
        scope: EmailCampaignScopeInterface,
    ): Promise<BrevoContactInterface> {
        try {
            const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
            await this.getContactsApi(scope).updateContact(idAsString, { emailBlacklisted: blocked, attributes, listIds, unlinkListIds });

            const brevoContact = await this.findContact(id, scope);

            if (!brevoContact) {
                throw new Error(`The brevo contact with the id ${id} not found`);
            }

            return brevoContact;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateMultipleContacts(contacts: Brevo.UpdateBatchContactsContactsInner[], scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const { response } = await this.getContactsApi(scope).updateBatchContacts({ contacts });
            return response.statusCode === 204;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteContact(id: number, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
            const { response } = await this.getContactsApi(scope).deleteContact(idAsString);

            return response.statusCode === 204;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findContact(idOrEmail: string | number, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface | null> {
        try {
            const idAsString = String(idOrEmail); // brevo expects a string, because it can be an email or the id
            const { body } = await this.getContactsApi(scope).getContactInfo(idAsString);

            return body;
        } catch (error) {
            // Brevo returns a 404 error if no contact is found and a 400 error if an invalid email is provided.
            if (isErrorFromBrevo(error) && (error.response.statusCode === 404 || error.response.statusCode === 400)) {
                return null;
            }

            handleBrevoError(error);
        }
    }

    public async getContactInfoByEmail(email: string, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface | null> {
        try {
            const data = await this.getContactsApi(scope).getContactInfo(email);
            const contact = data.body;
            if (!contact) return null;
            return contact;
        } catch (error) {
            // Brevo returns a 404 error if no contact is found and a 400 error if an invalid email is provided.
            if (isErrorFromBrevo(error) && (error.response.statusCode === 404 || error.response.statusCode === 400)) {
                return null;
            }
            handleBrevoError(error);
        }
    }

    public async findContactsByListId(
        id: number,
        limit: number,
        offset: number,
        scope: EmailCampaignScopeInterface,
    ): Promise<[BrevoContactInterface[], number]> {
        try {
            const data = await this.getContactsApi(scope).getContactsFromList(id, undefined, limit, offset);

            return [data.body.contacts, data.body.count];
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findContacts(limit: number, offset: number, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface[]> {
        try {
            const data = await this.getContactsApi(scope).getContacts(limit, offset);

            return data.body.contacts;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteContacts(contacts: BrevoContactInterface[], scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            for (const contact of contacts) {
                const idAsString = contact.id.toString();
                const response = await this.getContactsApi(scope).deleteContact(idAsString);
                if (response.response.statusCode !== 204) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async blacklistMultipleContacts(emails: string[], scope: EmailCampaignScopeInterface): Promise<void> {
        const blacklistedContacts = emails.map((email) => ({ email, emailBlacklisted: true }));

        await this.getContactsApi(scope).updateBatchContacts({ contacts: blacklistedContacts });
    }

    public async createBrevoContactList(title: string, scope: EmailCampaignScopeInterface): Promise<number | undefined> {
        const folderId = this.config.brevo.resolveConfig(scope).folderId;

        try {
            const contactList = {
                name: title,
                folderId: folderId,
            };

            const data = await this.getContactsApi(scope).createList(contactList);
            return data.body.id;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateBrevoContactList(id: number, title: string, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const data = await this.getContactsApi(scope).updateList(id, { name: title });
            return data.response.statusCode === 204;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteBrevoContactList(id: number, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const data = await this.getContactsApi(scope).deleteList(id);
            return data.response.statusCode === 204;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findBrevoContactListById(id: number, scope: EmailCampaignScopeInterface): Promise<BrevoApiContactList> {
        try {
            const data = await this.getContactsApi(scope).getList(id);
            return data.body;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findBrevoContactListsByIds(ids: number[], scope: EmailCampaignScopeInterface): Promise<BrevoApiContactList[]> {
        try {
            const lists: BrevoApiContactList[] = [];
            for await (const list of await this.getBrevoContactListResponses(scope)) {
                if (ids.includes(list.id)) {
                    lists.push(list);
                }
            }
            return lists;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    async *getBrevoContactListResponses(scope: EmailCampaignScopeInterface): AsyncGenerator<BrevoApiContactList, void, undefined> {
        const limit = 50;
        let offset = 0;

        while (true) {
            try {
                const listsResponse = await this.getContactsApi(scope).getLists(limit, offset);
                const lists = listsResponse.body.lists ?? [];

                if (lists.length === 0) {
                    break;
                }
                yield* lists;

                offset += limit;
            } catch (error) {
                handleBrevoError(error);
            }
        }
    }
}
