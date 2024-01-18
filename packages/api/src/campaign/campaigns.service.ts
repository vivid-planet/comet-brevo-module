import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { ObjectQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";

import { CampaignFilter } from "./dto/campaign.filter";
import { CampaignInterface } from "./entities/campaign-entity.factory";

@Injectable()
export class CampaignsService {
    getFindCondition(options: { search?: string; filter?: CampaignFilter }): ObjectQuery<CampaignInterface> {
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
