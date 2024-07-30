import { AffectedEntity, PaginatedResponseFactory, RequiredPermission } from "@comet/cms-api";
import { EntityRepository, FilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, Int, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { EmailCampaignScopeInterface } from "../types";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { BrevoContactsService } from "./brevo-contacts.service";
import { AssignedBrevoContactsArgs } from "./dto/assigned-brevo-contacts.args";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactInputInterface, BrevoContactUpdateInputInterface } from "./dto/brevo-contact-input.factory";
import { BrevoContactsArgsFactory } from "./dto/brevo-contacts.args";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

export function createBrevoContactResolver({
    BrevoContact,
    BrevoContactSubscribeInput,
    Scope,
    BrevoContactInput,
    BrevoContactUpdateInput,
}: {
    BrevoContact: Type<BrevoContactInterface>;
    BrevoContactSubscribeInput: Type<SubscribeInputInterface>;
    BrevoContactInput: Type<BrevoContactInputInterface>;
    BrevoContactUpdateInput: Type<Partial<BrevoContactInputInterface>>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}

    @ArgsType()
    class BrevoContactsArgs extends BrevoContactsArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoContact)
    @RequiredPermission(["brevo-newsletter"], { skipScopeCheck: true })
    class BrevoContactResolver {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            private readonly brevoContactsApiService: BrevoApiContactsService,
            private readonly brevoContactsService: BrevoContactsService,
            private readonly ecgRtrListService: EcgRtrListService,
            private readonly targetGroupService: TargetGroupsService,
            @InjectRepository("TargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => BrevoContact)
        @AffectedEntity(BrevoContact)
        async brevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
        ): Promise<BrevoContactInterface> {
            return this.brevoContactsApiService.findContact(id, scope);
        }

        @Query(() => PaginatedBrevoContacts)
        async brevoContacts(@Args() { offset, limit, email, targetGroupId, scope }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: true };

            if (targetGroupId) {
                where.id = targetGroupId;
                where.isMainList = false;
            }

            let targetGroup = await this.targetGroupRepository.findOne(where);

            if (!targetGroup) {
                if (targetGroupId) {
                    return new PaginatedBrevoContacts([], 0, { offset, limit });
                }

                // when there is no main target group for the scope, create one
                targetGroup = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(scope);
            }

            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email, scope);
                if (contact && contact.listIds.includes(targetGroup.brevoId)) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }
            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(targetGroup.brevoId, limit, offset, targetGroup.scope);

            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Query(() => PaginatedBrevoContacts)
        async assignedBrevoContacts(
            @Args() { offset, limit, email, targetGroupId, brevoId }: AssignedBrevoContactsArgs,
        ): Promise<PaginatedBrevoContacts> {
            const targetGroup = await this.targetGroupRepository.findOneOrFail({ id: targetGroupId });
            const brevoListId = brevoId ? targetGroup.brevoId : targetGroup.assignedContactsTargetGroupBrevoId;

            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email, targetGroup.scope);
                if (contact && contact.listIds.includes(targetGroup.brevoId)) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }

            if (!brevoListId) {
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }

            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(brevoListId, limit, offset, targetGroup.scope);

            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Mutation(() => BrevoContact)
        @AffectedEntity(BrevoContact)
        async updateBrevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
            @Args("input", { type: () => BrevoContactUpdateInput }) input: BrevoContactUpdateInputInterface,
        ): Promise<BrevoContactInterface> {
            // update attributes of contact before (un)assigning to target groups because they cannot be correctly validated for completeness
            const contact = await this.brevoContactsApiService.updateContact(
                id,
                {
                    blocked: input.blocked,
                    attributes: input.attributes,
                },
                scope,
            );

            const assignedListIds = contact.listIds;
            const mainListIds = (await this.targetGroupRepository.find({ brevoId: { $in: assignedListIds }, isMainList: true })).map(
                (targetGroup) => targetGroup.brevoId,
            );

            const updatedNonMainListIds = await this.brevoContactsService.getTargetGroupIdsForExistingContact({
                contact,
            });

            // update contact again with updated list ids depending on new attributes
            const contactWithUpdatedLists = await this.brevoContactsApiService.updateContact(
                id,
                {
                    listIds: updatedNonMainListIds.filter((listId) => !assignedListIds.includes(listId)),
                    unlinkListIds: assignedListIds.filter((listId) => !updatedNonMainListIds.includes(listId) && !mainListIds.includes(listId)),
                },
                scope,
            );

            return contactWithUpdatedLists;
        }

        @Mutation(() => SubscribeResponse)
        @RequiredPermission(["brevo-newsletter"], { skipScopeCheck: true })
        async createBrevoContact(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
            @Args("input", { type: () => BrevoContactInput })
            input: BrevoContactInputInterface,
        ): Promise<SubscribeResponse> {
            if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([input.email])).length > 0) {
                return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
            }

            const created = await this.brevoContactsService.createDoubleOptInContact({
                email: input.email,
                attributes: input.attributes,
                redirectionUrl: input.redirectionUrl,
                scope,
                templateId: this.config.brevo.resolveConfig(scope).doubleOptInTemplateId,
            });

            if (created) {
                return SubscribeResponse.SUCCESSFUL;
            }

            return SubscribeResponse.ERROR_UNKNOWN;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoContact)
        async deleteBrevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
        ): Promise<boolean> {
            return this.brevoContactsApiService.deleteContact(id, scope);
        }

        @Mutation(() => SubscribeResponse)
        async subscribeBrevoContact(
            @Args("input", { type: () => BrevoContactSubscribeInput }) data: SubscribeInputInterface,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<SubscribeResponse> {
            return this.brevoContactsService.subscribeBrevoContact(data, scope);
        }
    }

    return BrevoContactResolver;
}
