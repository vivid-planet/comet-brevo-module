import { AffectedEntity, RequiredPermission, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { BrevoApiFoldersService } from "../brevo-api/brevo-api-folders.service";
import { BrevoApiSenderService } from "../brevo-api/brevo-api-sender.service";
import { BrevoTransactionalMailsService } from "../brevo-api/brevo-api-transactional-mails.service";
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
            private readonly brevoFolderIdService: BrevoApiFoldersService,
            private readonly brevoTransactionalEmailsApiService: BrevoTransactionalMailsService,
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

        private async isValidFolderId({ folderId, scope }: { folderId: number; scope: EmailCampaignScopeInterface }): Promise<boolean> {
            for await (const folder of this.brevoFolderIdService.getAllBrevoFolders(scope)) {
                if (folder.id === folderId) {
                    return true;
                }
            }
            return false;
        }

        @RequiredPermission(["brevo-newsletter-config"], { skipScopeCheck: true })
        @Query(() => [BrevoApiSender], { nullable: true })
        async senders(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<Array<BrevoApiSender> | undefined> {
            const senders = await this.brevoSenderApiService.getSenders(scope);
            return senders;
        }

        @RequiredPermission(["brevo-newsletter-config"], { skipScopeCheck: true })
        @Query(() => [BrevoApiEmailTemplate], { nullable: true })
        async doubleOptInTemplates(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<Array<BrevoApiEmailTemplate> | undefined> {
            const { templates } = await this.brevoTransactionalEmailsApiService.getEmailTemplates(scope);
            const doubleOptInTemplates = templates?.filter((template) => template.tag === "optin" && template.isActive);
            return doubleOptInTemplates;
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
            if (!(await this.isValidSender({ email: input.senderMail, name: input.senderName, scope }))) {
                throw new Error("Sender not found");
            }

            if (!(await this.isValidTemplateId({ templateId: input.doubleOptInTemplateId, scope }))) {
                throw new Error("Template ID is not valid. ");
            }

            if (!(await this.isValidFolderId({ folderId: input.folderId, scope }))) {
                throw new Error("Folder ID is not valid. ");
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
            if (input.senderMail && input.senderName) {
                if (!(await this.isValidSender({ email: input.senderMail, name: input.senderName, scope: brevoConfig.scope }))) {
                    throw new Error("Sender not found");
                }
            }

            if (input.doubleOptInTemplateId) {
                if (!(await this.isValidTemplateId({ templateId: input.doubleOptInTemplateId, scope: brevoConfig.scope }))) {
                    throw new Error("Template ID is not valid. ");
                }
            }

            if (input.folderId) {
                if (!(await this.isValidFolderId({ folderId: input.folderId, scope: brevoConfig.scope }))) {
                    throw new Error("Folder ID is not valid. ");
                }
            }

            if (lastUpdatedAt) {
                validateNotModified(brevoConfig, lastUpdatedAt);
            }

            wrap(brevoConfig).assign({
                ...input,
                senderMail: input.senderMail,
                senderName: input.senderName,
                doubleOptInTemplateId: input.doubleOptInTemplateId,
            });

            await this.entityManager.flush();

            return brevoConfig;
        }
    }

    return BrevoConfigResolver;
}
