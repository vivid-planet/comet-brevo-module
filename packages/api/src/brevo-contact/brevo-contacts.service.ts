import { Injectable } from "@nestjs/common";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";

@Injectable()
export class BrevoContactsService {
    constructor(private readonly brevoContactsApiService: BrevoApiContactsService, private readonly targetGroupService: TargetGroupsService) {}

    public async createDoubleOptInContact(data: SubscribeInputInterface, templateId: number): Promise<SubscribeResponse> {
        const mainTargetGroupForScope = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(data.scope);

        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findNonMainTargetGroups(data, offset, limit);
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroup = this.targetGroupService.checkIfContactIsInTargetGroup(data, targetGroup.filters);

                if (contactIsInTargetGroup) {
                    targetGroupIds.push(targetGroup.brevoId);
                }
            }
        } while (offset < totalCount);

        const created = await this.brevoContactsApiService.createDoubleOptInBrevoContact(data, [mainTargetGroupForScope.brevoId], templateId);
        if (created) {
            return SubscribeResponse.SUCCESSFUL;
        }
        return SubscribeResponse.ERROR_UNKNOWN;
    }
}
