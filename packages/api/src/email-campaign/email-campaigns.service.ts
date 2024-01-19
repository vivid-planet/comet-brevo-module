import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { ObjectQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";

import { EmailCampaignFilter } from "./dto/email-campaign.filter";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";

@Injectable()
export class EmailCampaignsService {
    getFindCondition(options: { search?: string; filter?: EmailCampaignFilter }): ObjectQuery<EmailCampaignInterface> {
        const andFilters = [];

        if (options.search) {
            andFilters.push(searchToMikroOrmQuery(options.search, ["title", "subject"]));
        }

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }
}
