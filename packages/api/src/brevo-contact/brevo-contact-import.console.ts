import { InjectRepository } from "@mikro-orm/nestjs";
import { CreateRequestContext, EntityRepository, MikroORM } from "@mikro-orm/postgresql";
import { Inject, Injectable, Logger, Type } from "@nestjs/common";
import { isUUID, validateSync } from "class-validator";
import { InvalidOptionArgumentError } from "commander";
import * as fs from "fs";
import { Command, Console } from "nestjs-console";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";

import { BrevoContactImportService } from "../brevo-contact/brevo-contact-import.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { EmailCampaignScopeInterface } from "../types";

interface CommandOptions {
    path: string;
    scope: Type<EmailCampaignScopeInterface>;
    targetGroupIds: string[];
    sendDoubleOptIn: boolean;
}

export function createBrevoContactImportConsole({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }): Type<unknown> {
    @Injectable()
    @Console()
    class BrevoContactImportConsole {
        private readonly logger = new Logger(BrevoContactImportConsole.name);

        constructor(
            private readonly orm: MikroORM, // necessary for @CreateRequestContext() to work
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            private readonly brevoContactImportService: BrevoContactImportService,
            @InjectRepository("BrevoTargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
            @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
        ) {}

        @Command({
            command: "import-brevo-contacts",
            description: "import brevo contacts as csv",
            options: [
                {
                    flags: "-p, --path <path>",
                    required: true,
                    description: "path to csv file",
                    fn: (path) => {
                        if (!fs.existsSync(path)) {
                            throw new InvalidOptionArgumentError("Invalid path. File does not exist");
                        }
                        return path;
                    },
                },
                {
                    flags: "-s, --scope <scope>",
                    required: true,
                    description: "scope for current import file",
                    fn: (scope) => {
                        const parsedScope = JSON.parse(scope) as typeof Scope;
                        const validateErrors = validateSync(parsedScope);

                        if (validateErrors.length) {
                            throw new InvalidOptionArgumentError("Invalid scope. Scope is not allowed");
                        }
                        return parsedScope;
                    },
                },
                {
                    flags: "--targetGroupIds <ids...>",
                    required: false,
                    defaultValue: [],
                    description:
                        "list of target groups to apply the contacts to, format: comma separated UUIds, e.g. 2618c982-fdf8-4cab-9811-a21d3272c62c,362bbd39-02f1-4a41-8916-2402087751bc",
                    fn: (passedIds) => {
                        const ids = passedIds.split(",").map((id) => id.trim());

                        for (const id of ids) {
                            if (!isUUID(id)) {
                                throw new InvalidOptionArgumentError("Invalid targetGroupIds. Must be a list of UUIDs.");
                            }
                        }

                        return ids;
                    },
                },
            ],
        })
        @CreateRequestContext()
        async execute({ scope, path, targetGroupIds, sendDoubleOptIn }: CommandOptions): Promise<void> {
            const redirectUrl = this.config.brevo.resolveConfig(scope).redirectUrlForImport;
            const fileStream = fs.createReadStream(path);
            if (!this.validateRedirectUrl(redirectUrl, scope)) {
                throw new InvalidOptionArgumentError("Invalid scope. Scope is not allowed");
            }

            const result = await this.brevoContactImportService.importContactsFromCsv({
                fileStream,
                scope,
                sendDoubleOptIn,
                redirectUrl,
                targetGroupIds,
            });

            this.logger.log(result);
        }

        async validateRedirectUrl(urlToValidate: string, scope: Type<EmailCampaignScopeInterface>): Promise<boolean> {
            const configForScope = await this.brevoConfigRepository.findOneOrFail({ scope });

            if (!configForScope) {
                throw Error("Scope does not exist");
            }

            if (urlToValidate?.startsWith(configForScope.allowedRedirectionUrl)) {
                return true;
            }

            return false;
        }
    }

    return BrevoContactImportConsole;
}
