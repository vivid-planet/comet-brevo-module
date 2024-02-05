import { extractGraphqlFields, PaginatedResponseFactory, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, Reference, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Info, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";

import { BrevoApiCampaignsService } from "../brevo-api/brevo-api-campaigns.service";
import { BrevoApiCampaignStatistics } from "../brevo-api/dto/brevo-api-campaign-statistics";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { EmailCampaignScopeInterface } from "../types";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { EmailCampaignArgsFactory } from "./dto/email-campaign-args.factory";
import { EmailCampaignInputInterface } from "./dto/email-campaign-input.factory";
import { SendTestEmailCampaignArgs } from "./dto/send-test-email-campaign.args";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";
import { SendingState } from "./sending-state.enum";

export function createEmailCampaignsResolver({
    EmailCampaign,
    EmailCampaignInput,
    EmailCampaignUpdateInput,
    Scope,
    TargetGroup,
}: {
    EmailCampaign: Type<EmailCampaignInterface>;
    EmailCampaignInput: Type<EmailCampaignInputInterface>;
    EmailCampaignUpdateInput: Type<Partial<EmailCampaignInputInterface>>;
    Scope: Type<EmailCampaignScopeInterface>;
    TargetGroup: Type<TargetGroupInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedEmailCampaigns extends PaginatedResponseFactory.create(EmailCampaign) {}

    @ArgsType()
    class EmailCampaignsArgs extends EmailCampaignArgsFactory.create({ Scope }) {}

    @Resolver(() => EmailCampaign)
    class EmailCampaignsResolver {
        constructor(
            private readonly campaignsService: EmailCampaignsService,
            private readonly brevoApiCampaignsService: BrevoApiCampaignsService,
            private readonly ecgRtrListService: EcgRtrListService,
            private readonly entityManager: EntityManager,
            @InjectRepository("EmailCampaign") private readonly repository: EntityRepository<EmailCampaignInterface>,
            @InjectRepository("TargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => EmailCampaign)
        @SubjectEntity(EmailCampaign)
        async emailCampaign(@Args("id", { type: () => ID }) id: string): Promise<EmailCampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);
            return campaign;
        }

        @Query(() => PaginatedEmailCampaigns)
        async emailCampaigns(
            @Args() { search, filter, sort, offset, limit, scope }: EmailCampaignsArgs,
            @Info() info: GraphQLResolveInfo,
        ): Promise<PaginatedEmailCampaigns> {
            const where = this.campaignsService.getFindCondition({ search, filter });
            where.scope = scope;

            const fields = extractGraphqlFields(info, { root: "nodes" });
            const populate: string[] = [];
            if (fields.includes("targetGroup")) {
                populate.push("targetGroup");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: FindOptions<EmailCampaignInterface, any> = { offset, limit, populate };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);

            const emailCampaigns = this.campaignsService.loadEmailCampaignSendingStatesForEmailCampaigns(entities);

            return new PaginatedEmailCampaigns(emailCampaigns, totalCount);
        }

        @Mutation(() => EmailCampaign)
        async createEmailCampaign(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => EmailCampaignInput }, new DynamicDtoValidationPipe(EmailCampaignInput)) input: EmailCampaignInputInterface,
        ): Promise<EmailCampaignInterface> {
            const { targetGroup: targetGroupInput } = input;

            const campaign = this.repository.create({
                ...input,
                scope,
                targetGroup: targetGroupInput ? Reference.create(await this.targetGroupRepository.findOneOrFail(targetGroupInput)) : undefined,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            if (input.scheduledAt) {
                await this.campaignsService.saveEmailCampaignInBrevo(campaign.id, input.scheduledAt);
            }

            return campaign;
        }

        @Mutation(() => EmailCampaign)
        @SubjectEntity(EmailCampaign)
        async updateEmailCampaign(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => EmailCampaignUpdateInput }, new DynamicDtoValidationPipe(EmailCampaignUpdateInput))
            input: Partial<EmailCampaignInputInterface>,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<EmailCampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);

            if (lastUpdatedAt) {
                validateNotModified(campaign, lastUpdatedAt);
            }

            wrap(campaign).assign({
                ...input,
                content: input.content ? input.content.transformToBlockData() : undefined,
                scheduledAt: input.scheduledAt ?? null,
            });

            await this.entityManager.flush();

            let hasScheduleRemoved = false;

            if (campaign.brevoId) {
                const brevoEmailCampaign = await this.brevoApiCampaignsService.loadBrevoCampaignById(campaign.brevoId);
                const sendingState = this.brevoApiCampaignsService.getSendingInformationFromBrevoCampaign(brevoEmailCampaign);

                if (sendingState === SendingState.SENT) {
                    throw new Error("Cannot update email campaign that has already been sent.");
                }

                hasScheduleRemoved = input.scheduledAt == null && brevoEmailCampaign.scheduledAt !== null;

                if (hasScheduleRemoved && !(sendingState === SendingState.DRAFT)) {
                    await this.campaignsService.suspendEmailCampaign(campaign.brevoId);
                }
            }

            if (!hasScheduleRemoved && input.scheduledAt) {
                await this.campaignsService.saveEmailCampaignInBrevo(campaign.id, input.scheduledAt);
            }

            return campaign;
        }

        @Mutation(() => Boolean)
        @SubjectEntity(EmailCampaign)
        async deleteEmailCampaign(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);

            if (campaign.brevoId) {
                throw new Error("Cannot delete campaign that has already been scheduled once before.");
            }

            await this.entityManager.remove(campaign);
            await this.entityManager.flush();
            return true;
        }

        @Mutation(() => Boolean)
        async sendEmailCampaignNow(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            return this.campaignsService.sendEmailCampaignNow(id);
        }

        @Mutation(() => Boolean)
        async sendEmailCampaignToTestEmails(
            @Args("id", { type: () => ID }) id: string,
            @Args("data", { type: () => SendTestEmailCampaignArgs }) data: SendTestEmailCampaignArgs,
        ): Promise<boolean> {
            const campaign = await this.campaignsService.saveEmailCampaignInBrevo(id);

            const containedEcgRtrListEmails = await this.ecgRtrListService.getContainedEcgRtrListEmails(data.emails);
            const emailsNotInEcgRtrList = data.emails.filter((email) => !containedEcgRtrListEmails.includes(email));

            if (campaign.brevoId) {
                return this.brevoApiCampaignsService.sendTestEmail(campaign.brevoId, emailsNotInEcgRtrList);
            }

            return false;
        }

        @Query(() => BrevoApiCampaignStatistics, { nullable: true })
        async emailCampaignStatistics(@Args("id", { type: () => ID }) id: string): Promise<BrevoApiCampaignStatistics | null> {
            const campaign = await this.repository.findOneOrFail(id);

            return campaign.brevoId ? this.brevoApiCampaignsService.loadBrevoCampaignStatisticsById(campaign.brevoId) : null;
        }

        @ResolveField(() => SendingState)
        async sendingState(@Parent() campaign: EmailCampaignInterface): Promise<SendingState> {
            if (campaign.sendingState) {
                return campaign.sendingState;
            }

            if (campaign.brevoId) {
                const brevoCampaign = await this.brevoApiCampaignsService.loadBrevoCampaignById(campaign.brevoId);
                return this.brevoApiCampaignsService.getSendingInformationFromBrevoCampaign(brevoCampaign);
            }

            return SendingState.DRAFT;
        }

        @ResolveField(() => TargetGroup, { nullable: true })
        async targetGroup(@Parent() emailCampaign: EmailCampaignInterface): Promise<TargetGroupInterface | undefined> {
            return emailCampaign.targetGroup?.load();
        }
    }

    return EmailCampaignsResolver;
}
