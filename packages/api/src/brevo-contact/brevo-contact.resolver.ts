import { PaginatedResponseFactory, PublicApi } from "@comet/cms-api";
import { Inject, Type } from "@nestjs/common";
import { Args, Int, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactUpdateInput } from "./dto/brevo-contact.input";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

export function createBrevoContactResolver({
    BrevoContact,
    BrevoContactSubscribeInput,
}: {
    BrevoContact: Type<BrevoContactInterface>;
    BrevoContactSubscribeInput: Type<SubscribeInputInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}

    @Resolver(() => BrevoContact)
    class BrevoContactResolver {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            private readonly brevoContactsApiService: BrevoApiContactsService,
            private readonly brevoContactsService: BrevoContactsService,
            private readonly ecgRtrListService: EcgRtrListService,
        ) {}

        @Query(() => BrevoContact)
        async brevoContact(@Args("id", { type: () => Int }) id: number): Promise<BrevoContactInterface> {
            return this.brevoContactsApiService.findContact(id);
        }

        @Query(() => PaginatedBrevoContacts)
        async brevoContacts(@Args() { offset, limit, email }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
            // TODO: add correct lists when brevo contact list is implemented
            // 2 is the id of the first list in brevo that is created by default
            const contactListId = 2;
            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email);
                if (contact) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }

            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(contactListId, limit, offset);
            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Mutation(() => BrevoContact)
        async updateBrevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("input", { type: () => BrevoContactUpdateInput }) input: BrevoContactUpdateInput,
        ): Promise<BrevoContactInterface> {
            return this.brevoContactsApiService.updateContact(id, input);
        }

        @Mutation(() => Boolean)
        async deleteBrevoContact(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
            return this.brevoContactsApiService.deleteContact(id);
        }

        @Mutation(() => SubscribeResponse)
        @PublicApi()
        async subscribeBrevoContact(
            @Args("input", { type: () => BrevoContactSubscribeInput }) data: SubscribeInputInterface,
        ): Promise<SubscribeResponse> {
            if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([data.email])).length > 0) {
                return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
            }

            const created = await this.brevoContactsService.createDoubleOptInContact(data, this.config.brevo.doubleOptInTemplateId);

            if (created) {
                return SubscribeResponse.SUCCESSFUL;
            }

            return SubscribeResponse.ERROR_UNKNOWN;
        }
    }

    return BrevoContactResolver;
}
