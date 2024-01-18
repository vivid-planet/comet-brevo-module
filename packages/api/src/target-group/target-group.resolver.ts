import { PaginatedResponseFactory, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { EmailCampaignScopeInterface } from "src/types";

import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { TargetGroupArgsFactory } from "./dto/target-group-args.factory";
import { TargetGroupInputInterface } from "./dto/target-group-input.factory";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";
import { TargetGroupsService } from "./target-groups.service";

export function createTargetGroupsResolver({
    TargetGroup,
    TargetGroupInput,
    Scope,
}: {
    TargetGroup: Type<TargetGroupInterface>;
    TargetGroupInput: Type<TargetGroupInputInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedTargetGroups extends PaginatedResponseFactory.create(TargetGroup) {}

    @ArgsType()
    class TargetGroupsArgs extends TargetGroupArgsFactory.create({ Scope }) {}

    @Resolver(() => TargetGroup)
    class TargetGroupResolver {
        constructor(
            private readonly targetGroupsService: TargetGroupsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("TargetGroup") private readonly repository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => TargetGroup)
        @SubjectEntity(TargetGroup)
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
            return new PaginatedTargetGroups(entities, totalCount);
        }

        @Mutation(() => TargetGroup)
        async createTargetGroup(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => TargetGroupInput }, new DynamicDtoValidationPipe(TargetGroupInput)) input: TargetGroupInputInterface,
        ): Promise<TargetGroupInterface> {
            const targetGroup = this.repository.create({
                ...input,
                scope,
                // TODO: add correct brevo id
                brevoId: 1,
                // TODO: add correct logic for main list
                isMainList: false,
            });

            await this.entityManager.flush();

            return targetGroup;
        }

        @Mutation(() => TargetGroup)
        @SubjectEntity(TargetGroup)
        async updateTargetGroup(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => TargetGroupInput }, new DynamicDtoValidationPipe(TargetGroupInput)) input: TargetGroupInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<TargetGroupInterface> {
            const targetGroup = await this.repository.findOneOrFail(id);

            if (lastUpdatedAt) {
                validateNotModified(targetGroup, lastUpdatedAt);
            }

            wrap(targetGroup).assign({
                ...input,
            });

            await this.entityManager.flush();

            return targetGroup;
        }

        @Mutation(() => Boolean)
        @SubjectEntity(TargetGroup)
        async deleteTargetGroup(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const targetGroup = await this.repository.findOneOrFail(id);
            await this.entityManager.remove(targetGroup);
            await this.entityManager.flush();
            return true;
        }
    }

    return TargetGroupResolver;
}
