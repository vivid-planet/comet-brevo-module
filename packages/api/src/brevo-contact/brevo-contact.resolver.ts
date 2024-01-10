import { SubjectEntity } from "@comet/cms-api";
import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { BrevoContactsApiService } from "../brevo/brevo-contact-api.service";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContact } from "./dto/brevo-contact";
import { BrevoContactUpdateInput } from "./dto/brevo-contact.input";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";
import { PaginatedBrevoContacts } from "./dto/paginated-brevo-contact";

@Resolver(() => BrevoContact)
export class BrevoContactResolver {
    constructor(
        private readonly brevoContactsService: BrevoContactsService,
        private readonly brevoContactApiService: BrevoContactsApiService, // @Inject(CONFIG) private readonly config: Config,
    ) {}

    @Query(() => BrevoContact)
    @SubjectEntity(BrevoContact)
    async brevoContact(@Args("id", { type: () => ID }) id: string): Promise<true> {
        // TODO: add logic
        return true;
    }

    @Query(() => PaginatedBrevoContacts)
    // TODO: add search
    async brevoContacts(@Args() { offset, limit }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
        return this.brevoContactsService.findContacts({ offset, limit });
    }

    @Mutation(() => BrevoContact)
    @SubjectEntity(BrevoContact)
    async updateBrevoContact(
        @Args("id", { type: () => Int }) id: number,
        @Args("input", { type: () => BrevoContactUpdateInput }) input: BrevoContactUpdateInput,
    ): Promise<BrevoContact> {
        return this.brevoContactApiService.updateContact(id, input);
    }

    @Mutation(() => Boolean)
    @SubjectEntity(BrevoContact)
    async deleteBrevoContact(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
        return this.brevoContactApiService.deleteContact(id);
    }

    // TODO: subscribe to newsletter
}
