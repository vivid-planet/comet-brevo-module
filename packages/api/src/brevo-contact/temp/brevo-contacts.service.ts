import { filtersToMikroOrmQuery } from "@comet/cms-api";
import { ObjectQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";

import { BrevoContact } from "../entity/brevo-contact.entity";
import { BrevoContactFilter } from "./dto/brevo-contact.filter";

@Injectable()
export class BrevoContactsService {
    getFindCondition(options: { filter?: BrevoContactFilter }): ObjectQuery<BrevoContact> {
        const andFilters = [];

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }
}
