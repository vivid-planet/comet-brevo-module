import { PaginatedResponseFactory, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { MailingScopeInterface } from "src/types";

import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { MailingInputInterface } from "./dto/mailing-input.factory";
import { MailingArgsFactory } from "./dto/mailings-args.factory";
import { MailingInterface } from "./entities/mailing-entity.factory";
import { MailingsService } from "./mailings.service";

export function createMailingsResolver({
    Mailing,
    MailingInput,
    Scope,
}: {
    Mailing: Type<MailingInterface>;
    MailingInput: Type<MailingInputInterface>;
    Scope: Type<MailingScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedMailings extends PaginatedResponseFactory.create(Mailing) {}

    @ArgsType()
    class MailingsArgs extends MailingArgsFactory.create({ Scope }) {}

    @Resolver(() => Mailing)
    class MailingsResolver {
        constructor(
            private readonly mailingsService: MailingsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("Mailing") private readonly repository: EntityRepository<MailingInterface>,
        ) {}

        @Query(() => Mailing)
        @SubjectEntity(Mailing)
        async mailing(@Args("id", { type: () => ID }) id: string): Promise<MailingInterface> {
            const mailing = await this.repository.findOneOrFail(id);
            return mailing;
        }

        @Query(() => PaginatedMailings)
        async mailings(@Args() { search, filter, sort, offset, limit, scope }: MailingsArgs): Promise<PaginatedMailings> {
            const where = this.mailingsService.getFindCondition({ search, filter });

            (where as any).scope = scope;

            const options: FindOptions<MailingInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);
            return new PaginatedMailings(entities, totalCount);
        }

        @Mutation(() => Mailing)
        async createMailing(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => MailingInput }, new DynamicDtoValidationPipe(MailingInput)) input: MailingInputInterface,
        ): Promise<MailingInterface> {
            const mailing = this.repository.create({
                ...input,
                scope,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            return mailing;
        }

        @Mutation(() => Mailing)
        @SubjectEntity(Mailing)
        async updateMailing(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => MailingInput }, new DynamicDtoValidationPipe(MailingInput)) input: MailingInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<MailingInterface> {
            const mailing = await this.repository.findOneOrFail(id);

            if (lastUpdatedAt) {
                validateNotModified(mailing, lastUpdatedAt);
            }

            wrap(mailing).assign({
                ...input,
                content: input.content.transformToBlockData(),
            });

            await this.entityManager.flush();

            return mailing;
        }

        @Mutation(() => Boolean)
        @SubjectEntity(Mailing)
        async deleteMailing(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const mailing = await this.repository.findOneOrFail(id);
            await this.entityManager.remove(mailing);
            await this.entityManager.flush();
            return true;
        }
    }

    return MailingsResolver;
}
