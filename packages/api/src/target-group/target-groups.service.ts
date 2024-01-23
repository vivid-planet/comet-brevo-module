import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { EntityManager, EntityRepository, FilterQuery, ObjectQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { SubscribeInputInterface } from "../brevo-contact/dto/subscribe-input.factory";
import { BrevoContactAttributesInterface, BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { TargetGroupFilter } from "./dto/target-group.filter";
import { TargetGroupInputInterface } from "./dto/target-group-input.factory";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";

@Injectable()
export class TargetGroupsService {
    constructor(
        @InjectRepository("TargetGroup") private readonly repository: EntityRepository<TargetGroupInterface>,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly entityManager: EntityManager,
    ) {}

    getFindCondition(options: { search?: string; filter?: TargetGroupFilter }): ObjectQuery<TargetGroupInterface> {
        const andFilters = [];

        if (options.search) {
            andFilters.push(searchToMikroOrmQuery(options.search, ["title"]));
        }

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }

    public checkIfContactIsInTargetGroup(
        contactAttributes?: BrevoContactAttributesInterface,
        filters?: BrevoContactFilterAttributesInterface,
    ): boolean {
        if (!contactAttributes) return false;

        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (!value) continue;
                if (value.includes(contactAttributes[key])) {
                    continue;
                }

                return false;
            }
            return true;
        }

        return true;
    }

    public async assignContactsToContactList(input: TargetGroupInputInterface, brevoId: number, scope: EmailCampaignScopeInterface): Promise<true> {
        const mainScopeTargetGroupList = await this.repository.findOneOrFail({ scope, isMainList: true });

        let offset = 0;
        let totalCount = 0;
        do {
            const [contacts, totalContacts] = await this.brevoApiContactsService.findContactsByListId(mainScopeTargetGroupList.brevoId, 50, offset);
            totalCount = totalContacts;
            offset += contacts.length;

            const contactsInContactList: BrevoContactInterface[] = [];
            const contactsNotInContactList: BrevoContactInterface[] = [];

            for (const contact of contacts) {
                const contactIsInTargetGroup = this.checkIfContactIsInTargetGroup(contact.attributes, input.filters);

                if (contactIsInTargetGroup) {
                    contactsInContactList.push(contact);
                } else {
                    contactsNotInContactList.push(contact);
                }
            }

            if (contactsInContactList.length > 0) {
                await this.brevoApiContactsService.updateMultipleContacts(
                    contactsInContactList.map((contact) => ({ id: contact.id, listIds: [brevoId] })),
                );
            }
            if (contactsNotInContactList.length > 0) {
                await this.brevoApiContactsService.updateMultipleContacts(
                    contactsNotInContactList.map((contact) => ({ id: contact.id, unlinkListIds: [brevoId] })),
                );
            }
        } while (offset < totalCount);

        return true;
    }

    async findNonMainTargetGroups(data: SubscribeInputInterface, offset: number, limit: number): Promise<[TargetGroupInterface[], number]> {
        const [targetGroups, totalContactLists] = await this.repository.findAndCount(
            {
                scope: data.scope,
                isMainList: false,
            },
            { limit, offset },
        );

        return [targetGroups, totalContactLists];
    }

    async findOneTargetGroup(where: FilterQuery<TargetGroupInterface>): Promise<TargetGroupInterface | null> {
        const targetGroup = await this.repository.findOne(where);
        return targetGroup;
    }

    public async createIfNotExistMainTargetGroupForScope(scope: EmailCampaignScopeInterface): Promise<TargetGroupInterface> {
        const mainList = await this.repository.findOne({ scope, isMainList: true });

        if (mainList) {
            return mainList;
        }

        const title = "Main list for current scope";
        const brevoId = await this.brevoApiContactsService.createBrevoContactList({ title });

        if (brevoId) {
            const mainTargetGroupForScope = this.repository.create({ title, brevoId, scope, isMainList: true });

            await this.entityManager.flush();

            return mainTargetGroupForScope;
        }

        throw new Error("Brevo Error: Could not create contact list");
    }
}
