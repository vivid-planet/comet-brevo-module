import { CreateRequestContext, MikroORM } from "@mikro-orm/core";
import { Inject, Injectable, Type } from "@nestjs/common";
import { validateSync } from "class-validator";
import { InvalidOptionArgumentError } from "commander";
import * as fs from "fs";
import { Command, Console } from "nestjs-console";

import { BrevoContactImportService } from "../brevo-contact/brevo-contact-import.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignScopeInterface } from "../types";

interface CommandOptions {
    path: string;
    scope: Type<EmailCampaignScopeInterface>;
    targetGroupIds: number[];
}

export function createBrevoContactImportConsole({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }): Type<unknown> {
    @Injectable()
    @Console()
    class BrevoContactImportConsole {
        constructor(
            private readonly orm: MikroORM,
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            private readonly brevoContactImportService: BrevoContactImportService,
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
                    description: "list of target groups to apply the contacts to",
                    fn: (ids) => {
                        if (!Array.isArray(ids)) {
                            throw new InvalidOptionArgumentError("Invalid targetGroupIds. Must be an array of strings.");
                        }
                        // Convert the array of strings to an array of numbers
                        const numbersArray = ids.map((id) => {
                            const num = parseInt(id, 10);
                            if (isNaN(num)) {
                                throw new InvalidOptionArgumentError(`Invalid number: ${id}`);
                            }
                            return num;
                        });
                        return numbersArray;
                    },
                },
            ],
        })
        @CreateRequestContext()
        async execute(options: CommandOptions): Promise<void> {
            const redirectUrl = this.config.brevo.resolveConfig(options.scope).redirectUrlForImport;
            const content = fs.readFileSync(options.path);
            if (!this.validateRedirectUrl(redirectUrl, options.scope)) {
                throw new InvalidOptionArgumentError("Invalid scope. Scope is not allowed");
            }

            const result = await this.brevoContactImportService.importContactFromCsv(
                content.toString("utf8"),
                options.scope,
                redirectUrl,
                options.targetGroupIds,
            );

            console.log(result);
        }

        async validateRedirectUrl(urlToValidate: string, scope: Type<EmailCampaignScopeInterface>): Promise<boolean> {
            const configForScope = this.config.brevo.resolveConfig(scope);

            if (!configForScope) {
                throw Error("Scope does not exist");
            }

            if (urlToValidate?.startsWith(configForScope.allowedRedirectUrl)) {
                return true;
            }

            return false;
        }
    }

    return BrevoContactImportConsole;
}
