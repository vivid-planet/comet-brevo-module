import { AffectedEntity, RequiredPermission, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { BrevoApiAccountService } from "../brevo-api/brevo-api-account.service";
import { BrevoApiSenderService } from "../brevo-api/brevo-api-sender.service";
import { BrevoApiTransactionalEmailsApiService } from "../brevo-api/brevo-api-transactional-emails.service";
import { BrevoApiEmailTemplate } from "../brevo-api/dto/brevo-api-email-templates-list";
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
            private readonly brevoTransactionalEmailsApiService: BrevoApiTransactionalEmailsApiService,
            private readonly brevoApiAccountService: BrevoApiAccountService,

            @InjectRepository(BrevoConfig) private readonly repository: EntityRepository<BrevoConfigInterface>,
        ) {}

        private async isValidSender({ email, name, scope }: { email: string; name: string; scope: EmailCampaignScopeInterface }): Promise<boolean> {
            const senders = await this.brevoSenderApiService.getSenders(scope);

            if (senders && senders.some((sender) => sender.email === email && sender.name === name)) {
                return true;
            }
            return false;
        }

        private async isValidTemplateId({ templateId, scope }: { templateId: number; scope: EmailCampaignScopeInterface }): Promise<boolean> {
            const { templates } = await this.brevoTransactionalEmailsApiService.getEmailTemplates(scope);

            if (templates && templates.some((template) => template.id === templateId)) {
                return true;
            }

            return false;
        }

        private async isValidApiKey({ apiKey }: { apiKey: string }): Promise<boolean> {
            const account = await this.brevoApiAccountService.getAccountInformation({ apiKey });

            if (account !== undefined) {
                return true;
            }

            return false;
        }

        @RequiredPermission(["brevo-newsletter-config"], { skipScopeCheck: true })
        @Query(() => [BrevoApiSender], { nullable: true })
        async senders(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<Array<BrevoApiSender> | undefined> {
            const senders = await this.brevoSenderApiService.getSenders({ scope });
            return senders;
        }

        @RequiredPermission(["brevo-newsletter-config"], { skipScopeCheck: true })
        @Query(() => [BrevoApiEmailTemplate], { nullable: true })
        async doiTemplates(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<Array<BrevoApiEmailTemplate> | undefined> {
            const { templates } = await this.brevoTransactionalEmailsApiService.getEmailTemplates({ scope });
            const doiTemplates = templates?.filter((template) => template.tag === "optin" && template.isActive);
            return doiTemplates;
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
            if (!(await this.isValidApiKey({ apiKey: input.apiKey }))) {
                throw new Error("Api key is not valid");
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

            if ((await this.isApiKeySet(brevoConfig)) && input.apiKey) {
                throw new Error("Api key cannot be changed");
            }

            if (input.apiKey) {
                if (!(await this.isValidApiKey({ apiKey: input.apiKey }))) {
                    throw new Error("Api key is not valid");
                }

                wrap(brevoConfig).assign({
                    apiKey: input.apiKey,
                });

                await this.entityManager.flush();
                return brevoConfig;
            }

            if (!(await this.isApiKeySet(brevoConfig)) && !input.apiKey) {
                throw new Error("Api key is required before other fields can be updated");
            }

            if (!input.senderMail || !input.senderName || !input.doiTemplateId) {
                throw new Error("Sender mail, sender name and doi template id are required");
            }

            if (!(await this.isValidSender({ email: input.senderMail, name: input.senderName, scope: brevoConfig.scope }))) {
                throw new Error("Sender not found");
            }

            if (!(await this.isValidTemplateId({ templateId: input.doiTemplateId, scope: brevoConfig.scope }))) {
                throw new Error("Template not found");
            }

            wrap(brevoConfig).assign({
                senderMail: input.senderMail,
                senderName: input.senderName,
                doiTemplateId: input.doiTemplateId,
            });

            await this.entityManager.flush();
            return brevoConfig;
        }

        @ResolveField()
        async isApiKeySet(@Parent() brevoConfig: BrevoConfigInterface): Promise<boolean> {
            return brevoConfig.apiKey != undefined;
        }
    }

    return BrevoConfigResolver;
}
