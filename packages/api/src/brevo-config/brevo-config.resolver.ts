import { AffectedEntity, RequiredPermission, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { EmailCampaignScopeInterface } from "../types";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { BrevoConfigInput, BrevoConfigUpdateInput } from "./dto/brevo-config.input";
import { BrevoConfigInterface } from "./entities/brevo-config-entity.factory";

export function createBrevoConfigResolver({
    Scope,
    BrevoConfig,
}: {
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoConfig: Type<BrevoConfigInterface>;
}): Type<unknown> {
    @Resolver(() => BrevoConfig)
    @RequiredPermission(["brevo-newsletter"])
    class BrevoConfigResolver {
        constructor(
            private readonly entityManager: EntityManager,
            @InjectRepository(BrevoConfig) private readonly repository: EntityRepository<BrevoConfigInterface>,
        ) {}

        @Query(() => BrevoConfig, { nullable: true })
        async brevoConfig(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<BrevoConfigInterface | null> {
            const brevoConfig = await this.repository.findOne({ scope });
            return brevoConfig;
        }

        // TODO: add validation if the input contains a valid sender

        @Mutation(() => BrevoConfig)
        async createBrevoConfig(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => BrevoConfigInput }) input: BrevoConfigInput,
        ): Promise<BrevoConfigInterface> {
            const brevoConfig = this.repository.create({
                ...input,
                scope,
            });

            await this.entityManager.flush();

            return brevoConfig;
        }

        @Mutation(() => BrevoConfig)
        @AffectedEntity(BrevoConfig)
        async updateBrevoConfig(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => BrevoConfigUpdateInput }) input: BrevoConfigUpdateInput,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<BrevoConfigInterface> {
            const brevoConfig = await this.repository.findOneOrFail(id);
            if (lastUpdatedAt) {
                validateNotModified(brevoConfig, lastUpdatedAt);
            }

            wrap(brevoConfig).assign({
                ...input,
            });

            await this.entityManager.flush();

            return brevoConfig;
        }
    }

    return BrevoConfigResolver;
}
