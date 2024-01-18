import { PaginatedResponseFactory, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { EmailCampaignScopeInterface } from "src/types";

import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { EmailCampaignArgsFactory } from "./dto/email-campaign-args.factory";
import { EmailCampaignInputInterface } from "./dto/email-campaign-input.factory";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";

export function createEmailCampaignsResolver({
    EmailCampaign,
    EmailCampaignInput,
    Scope,
}: {
    EmailCampaign: Type<EmailCampaignInterface>;
    EmailCampaignInput: Type<EmailCampaignInputInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedEmailCampaigns extends PaginatedResponseFactory.create(EmailCampaign) {}

    @ArgsType()
    class EmailCampaignsArgs extends EmailCampaignArgsFactory.create({ Scope }) {}

    @Resolver(() => EmailCampaign)
    class EmailCampaignsResolver {
        constructor(
            private readonly campaignsService: EmailCampaignsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("EmailCampaign") private readonly repository: EntityRepository<EmailCampaignInterface>,
        ) {}

        @Query(() => EmailCampaign)
        @SubjectEntity(EmailCampaign)
        async emailCampaign(@Args("id", { type: () => ID }) id: string): Promise<EmailCampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);
            return campaign;
        }

        @Query(() => PaginatedEmailCampaigns)
        async emailCampaigns(@Args() { search, filter, sort, offset, limit, scope }: EmailCampaignsArgs): Promise<PaginatedEmailCampaigns> {
            const where = this.campaignsService.getFindCondition({ search, filter });

            (where as any).scope = scope;

            const options: FindOptions<EmailCampaignInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);
            return new PaginatedEmailCampaigns(entities, totalCount);
        }

        @Mutation(() => EmailCampaign)
        async createEmailCampaign(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => EmailCampaignInput }, new DynamicDtoValidationPipe(EmailCampaignInput)) input: EmailCampaignInputInterface,
        ): Promise<EmailCampaignInterface> {
            const campaign = this.repository.create({
                ...input,
                scope,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            return campaign;
        }

        @Mutation(() => EmailCampaign)
        @SubjectEntity(EmailCampaign)
        async updateEmailCampaign(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => EmailCampaignInput }, new DynamicDtoValidationPipe(EmailCampaignInput)) input: EmailCampaignInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<EmailCampaignInterface> {
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
        @SubjectEntity(EmailCampaign)
        async deleteEmailCampaign(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);
            await this.entityManager.remove(campaign);
            await this.entityManager.flush();
            return true;
        }
    }

    return EmailCampaignsResolver;
}
