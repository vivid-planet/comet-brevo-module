import { SubjectEntity, validateNotModified } from "@comet/cms-api";
import { FindOptions } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Mailing } from "../entities/mailing.entity";
import { MailingInput, MailingUpdateInput } from "./dto/mailing.input";
import { MailingsArgs } from "./dto/mailings.args";
import { PaginatedMailings } from "./dto/paginated-mailings";
import { MailingsService } from "./mailings.service";

@Resolver(() => Mailing)
export class MailingResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly mailingsService: MailingsService,
        @InjectRepository(Mailing) private readonly repository: EntityRepository<Mailing>,
    ) {}

    @Query(() => Mailing)
    @SubjectEntity(Mailing)
    async mailing(@Args("id", { type: () => ID }) id: string): Promise<Mailing> {
        const mailing = await this.repository.findOneOrFail(id);
        return mailing;
    }

    @Query(() => PaginatedMailings)
    async mailings(@Args() { search, filter, sort, offset, limit }: MailingsArgs): Promise<PaginatedMailings> {
        const where = this.mailingsService.getFindCondition({ search, filter });

        const options: FindOptions<Mailing> = { offset, limit };

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
    async createMailing(@Args("input", { type: () => MailingInput }) input: MailingInput): Promise<Mailing> {
        const mailing = this.repository.create({
            ...input,
        });

        await this.entityManager.flush();

        return mailing;
    }

    @Mutation(() => Mailing)
    @SubjectEntity(Mailing)
    async updateMailing(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => MailingUpdateInput }) input: MailingUpdateInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
    ): Promise<Mailing> {
        const mailing = await this.repository.findOneOrFail(id);
        if (lastUpdatedAt) {
            validateNotModified(mailing, lastUpdatedAt);
        }

        mailing.assign({
            ...input,
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
