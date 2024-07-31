import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { EntityManager, EntityRepository, FilterQuery, ObjectQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoContactAttributesInterface, BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { TargetGroupFilter } from "./dto/target-group.filter";
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

    public async assignContactsToContactList(
        filters: BrevoContactFilterAttributesInterface = {},
        targetGroup: TargetGroupInterface,
        scope: EmailCampaignScopeInterface,
    ): Promise<true> {
        const mainScopeTargetGroupList = await this.repository.findOneOrFail({ scope, isMainList: true });

        let offset = 0;
        let totalCount = 0;
        do {
            const [contacts, totalContacts] = await this.brevoApiContactsService.findContactsByListId(
                mainScopeTargetGroupList.brevoId,
                50,
                offset,
                scope,
            );
            totalCount = totalContacts;
            offset += contacts.length;

            const contactsInContactList: BrevoContactInterface[] = [];
            const contactsNotInContactList: BrevoContactInterface[] = [];

            for (const contact of contacts) {
                const contactIsInTargetGroupByFilters = this.checkIfContactIsInTargetGroup(contact.attributes, filters);

                const manuallyAssignedTargetGroup = targetGroup.assignedContactsTargetGroupBrevoId;
                const contactIsManuallyAssignedToTargetGroup = manuallyAssignedTargetGroup
                    ? contact.listIds.includes(manuallyAssignedTargetGroup)
                    : false;

                if (contactIsInTargetGroupByFilters || contactIsManuallyAssignedToTargetGroup) {
                    contactsInContactList.push(contact);
                } else {
                    contactsNotInContactList.push(contact);
                }
            }

            if (contactsInContactList.length > 0) {
                await this.brevoApiContactsService.updateMultipleContacts(
                    contactsInContactList.map((contact) => ({ id: contact.id, listIds: [targetGroup.brevoId] })),
                    scope,
                );
            }
            if (contactsNotInContactList.length > 0) {
                await this.brevoApiContactsService.updateMultipleContacts(
                    contactsNotInContactList.map((contact) => ({ id: contact.id, unlinkListIds: [targetGroup.brevoId] })),
                    scope,
                );
            }
        } while (offset < totalCount);

        return true;
    }

    async findTargetGroups({
        offset,
        limit,
        where,
    }: {
        offset: number;
        limit: number;
        where: FilterQuery<TargetGroupInterface>;
    }): Promise<[TargetGroupInterface[], number]> {
        const [targetGroups, totalContactLists] = await this.repository.findAndCount(where, { offset, limit });

        return [targetGroups, totalContactLists];
    }

    public async createIfNotExistMainTargetGroupForScope(scope: EmailCampaignScopeInterface): Promise<TargetGroupInterface> {
        const mainList = await this.repository.findOne({ scope, isMainList: true });

        if (mainList) {
            return mainList;
        }

        const title = "Main list for current scope";
        const brevoId = await this.brevoApiContactsService.createBrevoContactList(title, scope);

        if (brevoId) {
            const mainTargetGroupForScope = this.repository.create({ title, brevoId, scope, isMainList: true });

            await this.entityManager.flush();

            return mainTargetGroupForScope;
        }

        throw new Error("Brevo Error: Could not create contact list");
    }
}
