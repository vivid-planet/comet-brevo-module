import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";

@Injectable()
export class BrevoContactsService {
    constructor(private readonly brevoContactsApiService: BrevoApiContactsService, private readonly targetGroupService: TargetGroupsService) {}

    public async createDoubleOptInContact({
        email,
        attributes,
        redirectionUrl,
        scope,
        templateId,
    }: {
        email: string;
        attributes?: BrevoContactAttributesInterface;
        redirectionUrl: string;
        scope: EmailCampaignScopeInterface;
        templateId: number;
    }): Promise<boolean> {
        const mainTargetGroupForScope = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(scope);
        const targetGroupIds = await this.getTargetGroupIdsForContact({ scope, contactAttributes: attributes });

        const created = await this.brevoContactsApiService.createDoubleOptInBrevoContact(
            { email, redirectionUrl, attributes },
            [mainTargetGroupForScope.brevoId, ...targetGroupIds],
            templateId,
            scope,
        );
        return created;
    }

    public async getTargetGroupIdsForContact({
        contactAttributes,
        scope,
    }: {
        contactAttributes?: BrevoContactAttributesInterface;
        scope?: EmailCampaignScopeInterface;
    }): Promise<number[]> {
        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findNonMainTargetGroups({ scope, offset, limit });
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroup = this.targetGroupService.checkIfContactIsInTargetGroup(contactAttributes, targetGroup.filters);

                if (contactIsInTargetGroup) {
                    targetGroupIds.push(targetGroup.brevoId);
                }
            }
        } while (offset < totalCount);

        return targetGroupIds;
    }
}
