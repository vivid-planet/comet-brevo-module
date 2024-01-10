import { PublicApi } from "@comet/cms-api";
import { Inject } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { BrevoContactsApiService } from "../brevo/brevo-contact-api.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContact } from "./dto/brevo-contact";
import { BrevoContactUpdateInput } from "./dto/brevo-contact.input";
import { BrevoContactsArgs } from "./dto/brevo-contacts.args";
import { PaginatedBrevoContacts } from "./dto/paginated-brevo-contact";
import { SubscribeInput } from "./dto/subscribe.input";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

@Resolver(() => BrevoContact)
export class BrevoContactResolver {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly brevoContactsService: BrevoContactsService,
        private readonly brevoContactApiService: BrevoContactsApiService,
        private readonly ecgRtrListService: EcgRtrListService,
    ) {}

    @Query(() => BrevoContact)
    async brevoContact(@Args("id", { type: () => Int }) id: number): Promise<BrevoContact> {
        return this.brevoContactApiService.findContact(id);
    }

    @Query(() => PaginatedBrevoContacts)
    async brevoContacts(@Args() { offset, limit, email }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
        return this.brevoContactsService.findContacts({ offset, limit, email });
    }

    @Mutation(() => BrevoContact)
    async updateBrevoContact(
        @Args("id", { type: () => Int }) id: number,
        @Args("input", { type: () => BrevoContactUpdateInput }) input: BrevoContactUpdateInput,
    ): Promise<BrevoContact> {
        return this.brevoContactApiService.updateContact(id, input);
    }

    @Mutation(() => Boolean)
    async deleteBrevoContact(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
        return this.brevoContactApiService.deleteContact(id);
    }

    @Mutation(() => SubscribeResponse)
    @PublicApi()
    async subscribeBrevoContact(@Args("input", { type: () => SubscribeInput }) data: SubscribeInput): Promise<SubscribeResponse> {
        if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([data.email])).length > 0) {
            return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
        }

        return this.brevoContactsService.createDoubleOptInContact(data, this.config.api.brevo.templateDoubleOptIn);
    }
}
