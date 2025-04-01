import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoEmailImportLogInterface } from "./entity/brevo-email-import-log.entity.factory";

@Injectable()
export class BrevoEmailImportLogService {
    constructor(
        @InjectRepository("BrevoEmailImportLog") private readonly repository: EntityRepository<BrevoEmailImportLogInterface>,
        private readonly entityManager: EntityManager,
    ) {}
    public async addContactToLogs(
        email: string,
        responsibleUserId: string,
        scope: EmailCampaignScopeInterface,
    ): Promise<BrevoEmailImportLogInterface> {
        const log = this.repository.create({
            importedEmail: email,
            responsibleUserId,
            scope,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await this.entityManager.flush();
        return log;
    }
}
