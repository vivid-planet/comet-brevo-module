import { Inject, Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

@Injectable()
export class BrevoContactsService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly brevoContactsApiService: BrevoApiContactsService,
        private readonly ecgRtrListService: EcgRtrListService,
        private readonly targetGroupService: TargetGroupsService,
    ) {}

    public async createDoubleOptInContact({
        email,
        attributes,
        redirectionUrl,
        scope,
        templateId,
        listIds,
    }: {
        email: string;
        attributes?: BrevoContactAttributesInterface;
        redirectionUrl: string;
        scope: EmailCampaignScopeInterface;
        templateId: number;
        listIds?: number[];
    }): Promise<boolean> {
        const mainTargetGroupForScope = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(scope);

        const targetGroupIds = await this.getTargetGroupIdsForNewContact({ scope, contactAttributes: attributes });

        const brevoIds = [mainTargetGroupForScope.brevoId, ...targetGroupIds];

        if (listIds) {
            brevoIds.push(...listIds);
        }

        const created = await this.brevoContactsApiService.createDoubleOptInBrevoContact(
            { email, redirectionUrl, attributes },
            brevoIds,
            templateId,
            scope,
        );
        return created;
    }

    public async createTestContact({
        email,
        attributes,
        scope,
    }: {
        email: string;
        attributes?: BrevoContactAttributesInterface;
        scope: EmailCampaignScopeInterface;
    }): Promise<boolean> {
        const testTargetGroupForScope = await this.targetGroupService.createIfNotExistTestTargetGroupForScope(scope);

        const brevoIds = [testTargetGroupForScope.brevoId];

        const created = await this.brevoContactsApiService.createTestContact({ email, attributes }, brevoIds, scope);
        return created;
    }

    public async getTargetGroupIdsForNewContact({
        contactAttributes,
        scope,
        assignedContactsTargetGroupBrevoId,
    }: {
        contactAttributes?: BrevoContactAttributesInterface;
        scope?: EmailCampaignScopeInterface;
        assignedContactsTargetGroupBrevoId?: number;
    }): Promise<number[]> {
        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;
        const where = { isMainList: false, scope };

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findTargetGroups({ offset, limit, where });
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroup = this.targetGroupService.checkIfContactIsInTargetGroup(
                    contactAttributes,
                    targetGroup.filters,
                    assignedContactsTargetGroupBrevoId,
                );

                if (contactIsInTargetGroup) {
                    targetGroupIds.push(targetGroup.brevoId);
                }
            }
        } while (offset < totalCount);

        return targetGroupIds;
    }

    public async subscribeBrevoContact(data: SubscribeInputInterface, scope: EmailCampaignScopeInterface): Promise<SubscribeResponse> {
        if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([data.email])).length > 0) {
            return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
        }

        const created = await this.createDoubleOptInContact({
            ...data,
            scope,
            templateId: this.config.brevo.resolveConfig(scope).doubleOptInTemplateId,
        });

        if (created) {
            return SubscribeResponse.SUCCESSFUL;
        }

        return SubscribeResponse.ERROR_UNKNOWN;
    }

    public async getTargetGroupIdsForExistingContact({ contact }: { contact?: BrevoContactInterface }): Promise<number[]> {
        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;
        const where = { isMainList: false };

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findTargetGroups({ offset, limit, where });
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroupByAttributes = this.targetGroupService.checkIfContactIsInTargetGroup(
                    contact?.attributes,
                    targetGroup.filters,
                );

                if (contactIsInTargetGroupByAttributes) {
                    targetGroupIds.push(targetGroup.brevoId);
                }

                if (targetGroup.assignedContactsTargetGroupBrevoId && contact?.listIds.includes(targetGroup.assignedContactsTargetGroupBrevoId)) {
                    targetGroupIds.push(targetGroup.brevoId, targetGroup.assignedContactsTargetGroupBrevoId);
                }
            }
        } while (offset < totalCount);

        return targetGroupIds;
    }
}
