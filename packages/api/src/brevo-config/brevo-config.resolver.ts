import { AffectedEntity, RequiredPermission, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { BrevoApiSenderService } from "../brevo-api/brevo-api-sender.service";
import { BrevoApiSender } from "../brevo-api/dto/brevo-api-sender";
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
    @RequiredPermission(["brevo-newsletter-config"])
    class BrevoConfigResolver {
        constructor(
            private readonly entityManager: EntityManager,
            private readonly brevoSenderApiService: BrevoApiSenderService,
            @InjectRepository(BrevoConfig) private readonly repository: EntityRepository<BrevoConfigInterface>,
        ) {}

        private async isValidSender({ email, name }: { email: string; name: string }): Promise<boolean> {
            const senders = await this.brevoSenderApiService.getSenders(Scope);

            if (senders && senders.some((sender) => sender.email === email && sender.name === name)) {
                return true;
            }

            return false;
        }

        @Query(() => [BrevoApiSender], { nullable: true })
        async senders(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<Array<BrevoApiSender> | undefined> {
            const senders = await this.brevoSenderApiService.getSenders(scope);
            return senders;
        }

        @Query(() => BrevoConfig, { nullable: true })
        async brevoConfig(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<BrevoConfigInterface | null> {
            const brevoConfig = await this.repository.findOne({ scope });
            return brevoConfig;
        }

        @Mutation(() => BrevoConfig)
        async createBrevoConfig(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => BrevoConfigInput }) input: BrevoConfigInput,
        ): Promise<BrevoConfigInterface> {
            if (!(await this.isValidSender({ email: input.senderMail, name: input.senderName }))) {
                throw new Error("Sender not found");
            }

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
