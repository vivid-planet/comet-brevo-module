import { PaginatedResponseFactory, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { CampaignScopeInterface } from "src/types";

import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { CampaignsService } from "./campaigns.service";
import { CampaignArgsFactory } from "./dto/campaign-args.factory";
import { CampaignInputInterface } from "./dto/campaign-input.factory";
import { CampaignInterface } from "./entities/campaign-entity.factory";

export function createCampaignsResolver({
    Campaign,
    CampaignInput,
    Scope,
}: {
    Campaign: Type<CampaignInterface>;
    CampaignInput: Type<CampaignInputInterface>;
    Scope: Type<CampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedCampaigns extends PaginatedResponseFactory.create(Campaign) {}

    @ArgsType()
    class CampaignsArgs extends CampaignArgsFactory.create({ Scope }) {}

    @Resolver(() => Campaign)
    class CampaignsResolver {
        constructor(
            private readonly campaignsService: CampaignsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("Campaign") private readonly repository: EntityRepository<CampaignInterface>,
        ) {}

        @Query(() => Campaign)
        @SubjectEntity(Campaign)
        async campaign(@Args("id", { type: () => ID }) id: string): Promise<CampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);
            return campaign;
        }

        @Query(() => PaginatedCampaigns)
        async campaigns(@Args() { search, filter, sort, offset, limit, scope }: CampaignsArgs): Promise<PaginatedCampaigns> {
            const where = this.campaignsService.getFindCondition({ search, filter });

            (where as any).scope = scope;

            const options: FindOptions<CampaignInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);
            return new PaginatedCampaigns(entities, totalCount);
        }

        @Mutation(() => Campaign)
        async createCampaign(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => CampaignInput }, new DynamicDtoValidationPipe(CampaignInput)) input: CampaignInputInterface,
        ): Promise<CampaignInterface> {
            const campaign = this.repository.create({
                ...input,
                scope,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            return campaign;
        }

        @Mutation(() => Campaign)
        @SubjectEntity(Campaign)
        async updateCampaign(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => CampaignInput }, new DynamicDtoValidationPipe(CampaignInput)) input: CampaignInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<CampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);

            if (lastUpdatedAt) {
                validateNotModified(campaign, lastUpdatedAt);
            }

            wrap(campaign).assign({
                ...input,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            return campaign;
        }

        @Mutation(() => Boolean)
        @SubjectEntity(Campaign)
        async deleteCampaign(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);
            await this.entityManager.remove(campaign);
            await this.entityManager.flush();
            return true;
        }
    }

    return CampaignsResolver;
}
