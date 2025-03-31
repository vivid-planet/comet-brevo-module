import { BlobStorageBackendService, FileUpload, RequiredPermission } from "@comet/cms-api";
import { createHashedPath } from "@comet/cms-api/lib/blob-storage/utils/create-hashed-path.util";
import { FileUploadsConfig } from "@comet/cms-api/lib/file-uploads/file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "@comet/cms-api/lib/file-uploads/file-uploads.constants";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Args, ArgsType, Mutation, Resolver } from "@nestjs/graphql";
import { Readable } from "stream";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
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
        private fileUploadsConfig: FileUploadsConfig;

        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            @Inject(BrevoContactImportService) private readonly brevoContactImportService: BrevoContactImportService,
            @InjectRepository(FileUpload) private readonly fileUploadRepository: EntityRepository<FileUpload>,
            private readonly storageService: BlobStorageBackendService,
            private readonly moduleRef: ModuleRef,
            private readonly entityManager: EntityManager,
        ) {
            this.fileUploadsConfig = this.moduleRef.get(FILE_UPLOADS_CONFIG, { strict: false });
        }

        @Mutation(() => CsvImportInformation)
        async startBrevoContactImport(
            @Args() { fileId, targetGroupIds, scope, sendDoubleOptIn }: BrevoContactImportArgs,
        ): Promise<CsvImportInformation> {
            let storageFile: NodeJS.ReadableStream | null = null;
            let objectName = null;

            try {
                const fileUpload = await this.fileUploadRepository.findOne(fileId);

                if (fileUpload) {
                    objectName = createHashedPath(fileUpload.contentHash);

                    if (await this.storageService.fileExists(this.fileUploadsConfig.directory, objectName)) {
                        storageFile = await this.storageService.getFile(this.fileUploadsConfig.directory, objectName);
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
                    sendDoubleOptIn,
                });

                if (await this.storageService.fileExists(this.fileUploadsConfig.directory, objectName)) {
                    await this.storageService.removeFile(this.fileUploadsConfig.directory, objectName);
                    await this.fileUploadRepository.nativeDelete({ id: fileId });
                }

                await this.entityManager.flush();

                return result;
            } catch (error) {
                // in case of error always delete the uploaded file
                if (objectName && (await this.storageService.fileExists(this.fileUploadsConfig.directory, objectName))) {
                    await this.storageService.removeFile(this.fileUploadsConfig.directory, objectName);
                    await this.fileUploadRepository.nativeDelete({ id: fileId });
                }

                await this.entityManager.flush();

                throw error;
            }
        }
    }

    return BrevoContactImportResolver;
}
