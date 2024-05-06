import { AffectedEntity, PaginatedResponseFactory, RequiredPermission, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { TargetGroupArgsFactory } from "./dto/target-group-args.factory";
import { TargetGroupInputInterface } from "./dto/target-group-input.factory";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";
import { TargetGroupsService } from "./target-groups.service";

export function createTargetGroupsResolver({
    TargetGroup,
    TargetGroupInput,
    TargetGroupUpdateInput,
    Scope,
}: {
    TargetGroup: Type<TargetGroupInterface>;
    TargetGroupInput: Type<TargetGroupInputInterface>;
    TargetGroupUpdateInput: Type<Partial<TargetGroupInputInterface>>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedTargetGroups extends PaginatedResponseFactory.create(TargetGroup) {}

    @ArgsType()
    class TargetGroupsArgs extends TargetGroupArgsFactory.create({ Scope }) {}

    @Resolver(() => TargetGroup)
    @RequiredPermission(["pageTree"])
    class TargetGroupResolver {
        constructor(
            private readonly targetGroupsService: TargetGroupsService,
            private readonly brevoApiContactsService: BrevoApiContactsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("TargetGroup") private readonly repository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => TargetGroup)
        @AffectedEntity(TargetGroup)
        async targetGroup(@Args("id", { type: () => ID }) id: string): Promise<TargetGroupInterface> {
            const targetGroup = await this.repository.findOneOrFail(id);
            return targetGroup;
        }

        @Query(() => PaginatedTargetGroups)
        async targetGroups(@Args() { search, filter, sort, offset, limit, scope }: TargetGroupsArgs): Promise<PaginatedTargetGroups> {
            const where = this.targetGroupsService.getFindCondition({ search, filter });
            where.scope = scope;

            const options: FindOptions<TargetGroupInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);

            const brevoContactLists = await this.brevoApiContactsService.findBrevoContactListsByIds(entities.map((list) => list.brevoId));

            for (const contactList of entities) {
                const brevoContactList = brevoContactLists.find((item) => item.id === contactList.brevoId);

                if (brevoContactList) {
                    contactList.totalSubscribers = brevoContactList.uniqueSubscribers;
                    // TODO: brevo is returning a wrong value for totalBlacklisted
                    // contactList.totalContactsBlocked = brevoContactList.totalBlacklisted;
                }
            }

            return new PaginatedTargetGroups(entities, totalCount);
        }

        @Mutation(() => TargetGroup)
        async createTargetGroup(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => TargetGroupInput }, new DynamicDtoValidationPipe(TargetGroupInput)) input: TargetGroupInputInterface,
        ): Promise<TargetGroupInterface> {
            const brevoId = await this.brevoApiContactsService.createBrevoContactList(input);

            if (brevoId) {
                const targetGroup = this.repository.create({ ...input, brevoId, scope, isMainList: false });

                await this.entityManager.flush();

                await this.targetGroupsService.assignContactsToContactList(input.filters, targetGroup.brevoId, targetGroup.scope);

                return targetGroup;
            }

            throw new Error("Brevo Error: Could not create target group in brevo");
        }

        @Mutation(() => TargetGroup)
        @AffectedEntity(TargetGroup)
        async updateTargetGroup(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => TargetGroupUpdateInput }, new DynamicDtoValidationPipe(TargetGroupUpdateInput))
            input: Partial<TargetGroupInputInterface>,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<TargetGroupInterface> {
            const targetGroup = await this.repository.findOneOrFail(id);

            if (targetGroup.isMainList) {
                throw new Error("Cannot edit a main target group");
            }

            if (lastUpdatedAt) {
                validateNotModified(targetGroup, lastUpdatedAt);
            }

            await this.targetGroupsService.assignContactsToContactList(input.filters, targetGroup.brevoId, targetGroup.scope);

            if (input.title && input.title !== targetGroup.title) {
                const successfullyUpdatedContactList = await this.brevoApiContactsService.updateBrevoContactList(targetGroup.brevoId, input.title);
                if (!successfullyUpdatedContactList) {
                    throw Error("Brevo Error: Could not update contact list");
                }
            }

            wrap(targetGroup).assign({
                ...input,
            });

            await this.entityManager.flush();

            return targetGroup;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(TargetGroup)
        async deleteTargetGroup(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const targetGroup = await this.repository.findOneOrFail(id);

            if (targetGroup.isMainList) {
                throw new Error("Cannot delete a main target group");
            }

            const isDeletedInBrevo = await this.brevoApiContactsService.deleteBrevoContactList(targetGroup.brevoId);

            if (!isDeletedInBrevo) {
                return false;
            }

            await this.entityManager.remove(targetGroup);
            await this.entityManager.flush();

            return true;
        }

        @ResolveField()
        async totalSubscribers(@Parent() targetGroup: TargetGroupInterface): Promise<number> {
            if (targetGroup.totalSubscribers !== undefined) return targetGroup.totalSubscribers;

            const { uniqueSubscribers } = await this.brevoApiContactsService.findBrevoContactListById(targetGroup.brevoId);

            return uniqueSubscribers;
        }

        @ResolveField()
        async totalContactsBlocked(@Parent() targetGroup: TargetGroupInterface): Promise<number> {
            if (targetGroup.totalContactsBlocked !== undefined) return targetGroup.totalContactsBlocked;

            const { totalBlacklisted } = await this.brevoApiContactsService.findBrevoContactListById(targetGroup.brevoId);

            return totalBlacklisted;
        }
    }

    return TargetGroupResolver;
}
