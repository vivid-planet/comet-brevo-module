import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { TargetGroupInputInterface } from "src/target-group/dto/target-group-input.factory";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
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

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {
        this.contactsApi = new SibApiV3Sdk.ContactsApi();
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

        this.contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, apiKey);
    }

    public async createDoubleOptInBrevoContact(
        { email, redirectionUrl, attributes }: CreateDoubleOptInContactData,
        brevoIds: number[],
        templateId: number,
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        await this.setApiKey({ scope });

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
        }: {
            blocked?: boolean;
            attributes?: BrevoContactAttributesInterface;
            listIds?: number[];
            unlinkListIds?: number[];
        },
        scope: EmailCampaignScopeInterface,
    ): Promise<BrevoContactInterface> {
        await this.setApiKey({ scope });

        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        await this.contactsApi.updateContact(idAsString, { emailBlacklisted: blocked, attributes, listIds, unlinkListIds });
        return this.findContact({ id, scope });
    }

    public async updateMultipleContacts({
        contacts,
        scope,
    }: {
        contacts: SibApiV3Sdk.UpdateBatchContactsContacts[];
        scope: EmailCampaignScopeInterface;
    }): Promise<boolean> {
        await this.setApiKey({ scope });

        const { response } = await this.contactsApi.updateBatchContacts({ contacts });
        return response.statusCode === 204;
    }

    public async deleteContact({ id, scope }: { id: number; scope: EmailCampaignScopeInterface }): Promise<boolean> {
        await this.setApiKey({ scope });

        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        const { response } = await this.contactsApi.deleteContact(idAsString);

        return response.statusCode === 204;
    }

    public async findContact({ id, scope }: { id: number; scope: EmailCampaignScopeInterface }): Promise<BrevoContactInterface> {
        await this.setApiKey({ scope });

        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        const { body } = await this.contactsApi.getContactInfo(idAsString);

        return body;
    }

    public async getContactInfoByEmail({
        email,
        scope,
    }: {
        email: string;
        scope: EmailCampaignScopeInterface;
    }): Promise<BrevoContactInterface | undefined> {
        await this.setApiKey({ scope });

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

    public async findContactsByListId({
        id,
        limit,
        offset,
        scope,
    }: {
        id: number;
        limit: number;
        offset: number;
        scope: EmailCampaignScopeInterface;
    }): Promise<[BrevoContactInterface[], number]> {
        await this.setApiKey({ scope });

        const data = await this.contactsApi.getContactsFromList(id, undefined, limit, offset);

        return [data.body.contacts, data.body.count];
    }

    public async blacklistMultipleContacts({ emails, scope }: { emails: string[]; scope: EmailCampaignScopeInterface }): Promise<void> {
        await this.setApiKey({ scope });

        const blacklistedContacts = emails.map((email) => ({ email, emailBlacklisted: true }));

        await this.contactsApi.updateBatchContacts({ contacts: blacklistedContacts });
    }

    public async createBrevoContactList({
        scope,
        input,
    }: {
        input: TargetGroupInputInterface;
        scope: EmailCampaignScopeInterface;
    }): Promise<number | undefined> {
        await this.setApiKey({ scope });

        const contactList = {
            name: input.title,
            folderId: 1, // folderId is required, folder #1 is created by default
        };

        const data = await this.contactsApi.createList(contactList);
        return data.body.id;
    }

    public async updateBrevoContactList({ id, title, scope }: { id: number; title: string; scope: EmailCampaignScopeInterface }): Promise<boolean> {
        await this.setApiKey({ scope });

        const data = await this.contactsApi.updateList(id, { name: title });
        return data.response.statusCode === 204;
    }

    public async deleteBrevoContactList({ id, scope }: { id: number; scope: EmailCampaignScopeInterface }): Promise<boolean> {
        await this.setApiKey({ scope });

        const data = await this.contactsApi.deleteList(id);
        return data.response.statusCode === 204;
    }

    public async findBrevoContactListById({ id, scope }: { id: number; scope: EmailCampaignScopeInterface }): Promise<BrevoApiContactList> {
        await this.setApiKey({ scope });

        const data = await this.contactsApi.getList(id);
        return data.body;
    }

    public async findBrevoContactListsByIds({ ids, scope }: { ids: number[]; scope: EmailCampaignScopeInterface }): Promise<BrevoApiContactList[]> {
        await this.setApiKey({ scope });

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
