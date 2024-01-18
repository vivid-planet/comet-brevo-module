import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@comet/cms-api";
import { ObjectQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";

import { TargetGroupFilter } from "./dto/target-group.filter";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";

@Injectable()
export class TargetGroupsService {
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
}
