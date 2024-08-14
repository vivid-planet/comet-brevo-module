import { parseString } from "@fast-csv/parse";
import { Inject, Injectable } from "@nestjs/common";
import { IsEmail, IsNotEmpty, validateOrReject } from "class-validator";

import { isErrorFromBrevo } from "../brevo-api/brevo-api.utils";
import { BrevoApiContactsService, CreateDoubleOptInContactData } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactsService } from "../brevo-contact/brevo-contacts.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { EmailCampaignScopeInterface } from "../types";

class ValidateableRow {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

@Injectable()
export class BrevoContactImportService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly brevoContactsService: BrevoContactsService,
        private readonly targetGroupsService: TargetGroupsService,
    ) {}

    async importContactFromCsv<T extends ValidateableRow>(
        csvContent: string,
        scope: EmailCampaignScopeInterface,
        redirectUrl: string,
        targetGroupIds: number[] = [],
        validateable?: T,
    ): Promise<{ created: number; updated: number; failed: number }> {
        let created = 0;
        let updated = 0;
        let failed = 0;
        const contacts = await this.parseCsvToBrevoContacts(csvContent, redirectUrl, validateable);

        for (const contact of contacts) {
            try {
                let brevoContact;
                try {
                    brevoContact = await this.brevoApiContactsService.findContact(contact.email, scope);
                } catch (error) {
                    // Brevo throws 404 error if no contact was found
                    if (!isErrorFromBrevo(error)) {
                        throw error;
                    }
                    if (error.response.statusCode !== 404) {
                        throw error;
                    }
                }
                if (brevoContact && !brevoContact.emailBlacklisted) {
                    const mainTargetGroupForScope = await this.targetGroupsService.createIfNotExistMainTargetGroupForScope(scope);

                    const updatedBrevoContact = await this.brevoApiContactsService.updateContact(
                        brevoContact.id,
                        { ...contact, listIds: [mainTargetGroupForScope.brevoId, ...targetGroupIds, ...brevoContact.listIds] },
                        scope,
                    );
                    if (updatedBrevoContact) updated++;
                    else failed++;
                } else if (!brevoContact) {
                    const success = await this.brevoContactsService.createDoubleOptInContact({
                        ...contact,
                        scope,
                        templateId: this.config.brevo.resolveConfig(scope).doubleOptInTemplateId,
                        listIds: targetGroupIds,
                    });
                    if (success) created++;
                    else failed++;
                }
            } catch (err) {
                console.error(err);
                failed++;
            }
        }
        return { created, updated, failed };
    }

    async parseCsvToBrevoContacts<T extends ValidateableRow>(
        csvContent: string,
        redirectUrl: string,
        validateable?: T,
    ): Promise<CreateDoubleOptInContactData[]> {
        const brevoContacts: CreateDoubleOptInContactData[] = [];

        return new Promise((resolve, reject) => {
            parseString(csvContent, { headers: true, delimiter: ";" })
                .on("error", (error) => {
                    console.error(error);
                    reject(error);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on("data", async (row: Record<string, any>) => {
                    try {
                        const contactData = await this.processRow(row, redirectUrl, validateable);
                        brevoContacts.push(contactData);
                    } catch (validationError) {
                        console.error(validationError);
                        reject(validationError);
                    }
                })
                .on("end", (rowCount: number) => {
                    console.log(`Parsed ${rowCount} rows`);
                    resolve(brevoContacts);
                });
        });
    }

    private async processRow<T extends ValidateableRow>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        row: Record<string, any>,
        redirectUrlForImport: string,
        validateable?: T,
    ): Promise<CreateDoubleOptInContactData> {
        let validatedRow: ValidateableRow;

        if (validateable) {
            validatedRow = await this.populateAndValidateRow(row, validateable);
        } else {
            validatedRow = await this.createAndValidateRow(row);
        }

        const { email, ...data } = validatedRow;
        return {
            email,
            redirectionUrl: redirectUrlForImport,
            attributes: { ...data },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async populateAndValidateRow<T extends ValidateableRow>(row: Record<string, any>, validateable: T): Promise<ValidateableRow> {
        const keysOfProps = Object.keys(validateable);
        keysOfProps.forEach((key) => {
            const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];
            if (value) {
                validateable[key as keyof T] = value;
            }
        });
        await validateOrReject(validateable);
        return validateable;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async createAndValidateRow(row: Record<string, any>): Promise<ValidateableRow> {
        const mappedRow = new ValidateableRow();
        Object.keys(row).forEach((key) => {
            if (key.toLowerCase() === "email") {
                mappedRow.email = row[key];
            } else {
                mappedRow[key] = row[key];
            }
        });
        await validateOrReject(mappedRow);
        return mappedRow;
    }
}
