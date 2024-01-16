import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";
import { BrevoContactInterface } from "src/brevo-contact/dto/brevo-contact.factory";
import { BrevoContactAttributesInterface } from "src/types";

import { BrevoContactUpdateInput } from "../brevo-contact/dto/brevo-contact.input";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { isErrorFromBrevo } from "./brevo-api.utils";

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

    public async createDoubleOptInContact(
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

    public async updateContact(id: number, { blocked }: BrevoContactUpdateInput): Promise<BrevoContactInterface> {
        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        await this.contactsApi.updateContact(idAsString, { emailBlacklisted: blocked });
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
            // Brevo throws 404 error if no contact was found
            if (isErrorFromBrevo(error) && error.response.statusCode === 404) {
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
}
