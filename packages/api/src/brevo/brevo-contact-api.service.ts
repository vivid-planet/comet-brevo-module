import { Inject, Injectable } from "@nestjs/common";
import * as SibApiV3Sdk from "@sendinblue/client";

import { BrevoContact } from "../brevo-contact/dto/brevo-contact";
import { BrevoContactUpdateInput } from "../brevo-contact/dto/brevo-contact.input";
import { CometBrevoModuleConfig } from "../config/comet-brevo-module.config";
import { COMET_BREVO_MODULE_CONFIG } from "../config/comet-brevo-module.constants";
import { isErrorFromBrevo } from "./brevo.utils";

export interface CreateDoubleOptInContactData {
    email: string;
    firstName?: string;
    lastName?: string;
    redirectURL: string;
}

@Injectable()
export class BrevoContactsApiService {
    private readonly contactsApi: SibApiV3Sdk.ContactsApi;

    constructor(@Inject(COMET_BREVO_MODULE_CONFIG) private readonly config: CometBrevoModuleConfig) {
        this.contactsApi = new SibApiV3Sdk.ContactsApi();
        this.contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, config.api.brevo.apiKey);
    }

    public async createDoubleOptInContact(input: CreateDoubleOptInContactData, brevoIds: number[], templateId: number): Promise<boolean> {
        const contact = {
            email: input.email,
            includeListIds: brevoIds,
            templateId,
            redirectionUrl: input.redirectURL,
            // TODO: mapping
            attributes: {
                FIRSTNAME: input.firstName,
                LASTNAME: input.lastName,
            },
        };
        const { response } = await this.contactsApi.createDoiContact(contact);

        return response.statusCode === 204 || response.statusCode === 201;
    }

    public async updateContact(id: number, { blocked }: BrevoContactUpdateInput): Promise<BrevoContact> {
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

    public async findContact(id: number): Promise<BrevoContact> {
        const idAsString = id.toString(); // brevo expects a string, because it can be an email or the id, so we have to transform the id to string
        const { body } = await this.contactsApi.getContactInfo(idAsString);

        return {
            ...body,
            firstName: body.attributes.FIRSTNAME,
            lastName: body.attributes.LASTNAME,
        };
    }

    public async getContactInfoByEmail(email: string): Promise<BrevoContact | undefined> {
        try {
            const data = await this.contactsApi.getContactInfo(email);
            const contact = data.body;
            if (!contact) return undefined;
            return {
                ...contact,
                firstName: contact.attributes.FIRSTNAME,
                lastName: contact.attributes.LASTNAME,
            };
        } catch (error) {
            // Brevo throws 404 error if no contact was found
            if (isErrorFromBrevo(error) && error.response.statusCode === 404) {
                return undefined;
            }

            throw error;
        }
    }

    public async findContactsByListId(id: number, limit: number, offset: number): Promise<[BrevoContact[], number]> {
        const data = await this.contactsApi.getContactsFromList(id, undefined, limit, offset);

        return [
            data.body.contacts.map((data) => ({
                ...data,
                firstName: data.attributes.FIRSTNAME,
                lastName: data.attributes.LASTNAME,
            })),
            data.body.count,
        ];
    }

    public async blacklistMultipleContacts(emails: string[]): Promise<void> {
        const blacklistedContacts = emails.map((email) => ({ email, emailBlacklisted: true }));

        await this.contactsApi.updateBatchContacts({ contacts: blacklistedContacts });
    }
}
