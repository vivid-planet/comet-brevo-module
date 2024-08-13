import { CometValidationException, RequiredPermission } from "@comet/cms-api";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Body, Controller, Inject, Post, Type, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";

import { BrevoContactImportService } from "../brevo-contact/brevo-contact-import.service";
import { ImporterErrorInterceptor } from "../brevo-contact/contact-importer-error.interceptor";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignScopeInterface } from "../types";

export function createBrevoContactImportController({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }): Type<unknown> {
    @Controller("brevo-contacts-csv")
    class BrevoContactImportController {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            @Inject(BrevoContactImportService) private readonly brevoContactImportService: BrevoContactImportService,
            @InjectRepository("TargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Post("upload")
        @UseInterceptors(
            FileInterceptor("file", {
                limits: { fileSize: 15 * 1024 * 1024 },
                fileFilter: (_, file, cb) => {
                    if (file.mimetype !== "text/csv") {
                        return cb(new CometValidationException(`Unsupported mime type: ${file.mimetype}`), false);
                    }

                    return cb(null, true);
                },
            }),
        )
        @UseInterceptors(ImporterErrorInterceptor)
        @RequiredPermission(["brevo-newsletter"], { skipScopeCheck: true })
        async upload(@UploadedFile() file: Express.Multer.File, @Body("scope") scope: string, @Body("listIds") listIds?: string): Promise<void> {
            const contentContent = file.buffer.toString("utf8");
            const parsedScope = JSON.parse(scope) as EmailCampaignScopeInterface;

            let parsedListIds = undefined;
            if (listIds) parsedListIds = JSON.parse(listIds) as string[];

            const targetGroupBrevoIds = (await this.targetGroupRepository.find({ id: { $in: parsedListIds } })).map(({ brevoId }) => brevoId);

            const redirectUrl = this.config.brevo.resolveConfig(parsedScope).redirectUrlForImport;
            await this.brevoContactImportService.importContactFromCsv(contentContent, parsedScope, redirectUrl, targetGroupBrevoIds);
        }
    }

    return BrevoContactImportController;
}
