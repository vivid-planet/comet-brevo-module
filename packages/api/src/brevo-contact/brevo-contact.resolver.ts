import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { BrevoContactService } from "../brevo/brevo-contact.service";
import { BrevoContact } from "./dto/brevo-contact";
import { BrevoUpdateContactArgs } from "./dto/brevo-contact-update.args";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";
import { PaginatedBrevoContact } from "./dto/paginated-brevo-contact";

@Resolver()
export class BrevoContactResolver {
    constructor(
        private readonly newsletterContactService: BrevoContactService,
        private readonly brevoContactService: BrevoContactService, // @Inject(CONFIG) private readonly config: Config,
    ) {}

    @Query(() => PaginatedBrevoContact)
    async brevoContacts(@Args() args: BrevoContactsArgs): Promise<boolean> {
        // return this.brevoContactService.findContacts(args);
        return true;
    }

    @Mutation(() => Boolean)
    async deleteBrevoContact(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
        return this.brevoContactService.deleteContact(id);
    }

    @Mutation(() => BrevoContact)
    async updateBrevoContact(@Args() args: BrevoUpdateContactArgs): Promise<BrevoContact> {
        return this.brevoContactService.updateContact(args);
    }

    // @Mutation(() => SubscribeNewsletterResponse)
    // @PublicApi()
    // async subscribeNewsletter(
    //     @Args("input", { type: () => NewsletterSubscribeContactListInput }) data: NewsletterSubscribeContactListInput,
    // ): Promise<SubscribeNewsletterResponse> {
    //     if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([data.email])).length > 0) {
    //         return SubscribeNewsletterResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
    //     }

    //     return this.newsletterContactService.createDoubleOptInContact(data, this.config.newsletter.brevo.templateDoubleOptIn);
    // }
}
