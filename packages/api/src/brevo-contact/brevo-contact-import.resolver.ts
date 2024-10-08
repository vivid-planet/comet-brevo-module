import { BlobStorageBackendService, PublicUpload, RequiredPermission } from "@comet/cms-api";
import { createHashedPath } from "@comet/cms-api/lib/dam/files/files.utils";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, Mutation, Resolver } from "@nestjs/graphql";
import { Readable } from "stream";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { config } from "../config/config";
import { EmailCampaignScopeInterface } from "../types";
import { BrevoContactImportService, CsvImportInformation } from "./brevo-contact-import.service";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactImportArgsFactory } from "./dto/brevo-contact-import.args";

export function createBrevoContactImportResolver({
    Scope,
    BrevoContact,
}: {
    BrevoContact: Type<BrevoContactInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ArgsType()
    class BrevoContactImportArgs extends BrevoContactImportArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoContact)
    @RequiredPermission(["brevo-newsletter"], { skipScopeCheck: true })
    class BrevoContactImportResolver {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            @Inject(BrevoContactImportService) private readonly brevoContactImportService: BrevoContactImportService,
            private readonly storageService: BlobStorageBackendService,
            @InjectRepository(PublicUpload) private readonly publicUploadRepository: EntityRepository<PublicUpload>,
            private readonly entityManager: EntityManager,
        ) {}

        @Mutation(() => CsvImportInformation)
        async startBrevoContactImport(@Args() { fileId, targetGroupIds, scope }: BrevoContactImportArgs): Promise<CsvImportInformation> {
            let storageFile: NodeJS.ReadableStream | null = null;
            let objectName = null;
            const publicUpload = await this.publicUploadRepository.findOne(fileId);

            if (publicUpload) {
                objectName = createHashedPath(publicUpload.contentHash);

                if (await this.storageService.fileExists(config.brevoContactImportUploads.importDirectory, objectName)) {
                    storageFile = await this.storageService.getFile(config.brevoContactImportUploads.importDirectory, objectName);
                }
            }

            if (!storageFile || !objectName) {
                throw new Error("File not found");
            }

            const redirectUrl = this.config.brevo.resolveConfig(scope).redirectUrlForImport;

            const result = await this.brevoContactImportService.importContactsFromCsv({
                fileStream: Readable.from(storageFile),
                scope,
                redirectUrl,
                targetGroupIds,
            });

            if (await this.storageService.fileExists(config.brevoContactImportUploads.importDirectory, objectName)) {
                await this.storageService.removeFile(config.brevoContactImportUploads.importDirectory, objectName);
                await this.publicUploadRepository.nativeDelete({ id: fileId });
            }

            await this.entityManager.flush();

            return result;
        }
    }

    return BrevoContactImportResolver;
}
