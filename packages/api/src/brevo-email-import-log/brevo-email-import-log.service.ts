import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { hashEmail } from "../util/hash.util";
import { BrevoEmailImportLogInterface, ContactSource } from "./entity/brevo-email-import-log.entity.factory";

@Injectable()
export class BrevoEmailImportLogService {
    private readonly secretKey: string;
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoEmailImportLog") private readonly repository: EntityRepository<BrevoEmailImportLogInterface>,
        private readonly entityManager: EntityManager,
    ) {
        this.secretKey = this.config.emailHashKey;
    }
    public async addContactToLogs(
        email: string,
        responsibleUserId: string,
        scope: EmailCampaignScopeInterface,
        contactSource: ContactSource,
        importId?: string,
    ): Promise<BrevoEmailImportLogInterface> {
        const log = this.repository.create({
            importedEmail: hashEmail(email, this.secretKey),
            responsibleUserId,
            scope,
            createdAt: new Date(),
            updatedAt: new Date(),
            contactSource,
            importId,
        });
        await this.entityManager.flush();
        return log;
    }
}
