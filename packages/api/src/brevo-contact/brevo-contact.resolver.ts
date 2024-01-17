import { PaginatedResponseFactory } from "@comet/cms-api";
import { Type } from "@nestjs/common";
import { Args, Int, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactUpdateInput } from "./dto/brevo-contact.input";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";

export function createBrevoContactResolver({ BrevoContact }: { BrevoContact: Type<BrevoContactInterface> }): Type<unknown> {
    @ObjectType()
    class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}

    @Resolver(() => BrevoContact)
    class BrevoContactResolver {
        constructor(
            private readonly brevoContactsApiService: BrevoApiContactsService,
            private readonly brevoContactApiService: BrevoApiContactsService,
        ) {}

        @Query(() => BrevoContact)
        async brevoContact(@Args("id", { type: () => Int }) id: number): Promise<BrevoContactInterface> {
            return this.brevoContactApiService.findContact(id);
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
            return this.brevoContactApiService.updateContact(id, input);
        }

        @Mutation(() => Boolean)
        async deleteBrevoContact(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
            return this.brevoContactApiService.deleteContact(id);
        }

        // TODO: subscribe to newsletter
    }

    return BrevoContactResolver;
}
