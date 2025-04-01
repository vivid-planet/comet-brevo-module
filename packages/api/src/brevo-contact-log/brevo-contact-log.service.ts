import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoContactLogInterface } from "./entity/brevo-contact-log.entity.factory";

@Injectable()
export class BrevoContactLogService {
    constructor(
        @InjectRepository("BrevoContactLog") private readonly repository: EntityRepository<BrevoContactLogInterface>,
        private readonly entityManager: EntityManager,
    ) {}
    public async addContactsToLogs(
        emails: string[],
        responsibleUserId: string,
        scope: EmailCampaignScopeInterface,
    ): Promise<BrevoContactLogInterface[]> {
        const logs = emails.map((importedEmail) => {
            return this.repository.create({
                importedEmail,
                responsibleUserId,
                scope,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        await this.entityManager.flush();
        return logs;
    }
}
