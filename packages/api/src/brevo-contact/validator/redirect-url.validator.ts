import { Inject, Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants";

export const IsValidRedirectURL = (scope: EmailCampaignScopeInterface, validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRedirectURLConstraint,
            constraints: [scope],
        });
    };
};

@ValidatorConstraint({ name: "IsValidRedirectURL", async: true })
@Injectable()
export class IsValidRedirectURLConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    async validate(urlToValidate: string, args: ValidationArguments): Promise<boolean> {
        const [scope] = args.constraints;
        const configForScope = this.config.brevo.resolveConfig(scope);

        if (!configForScope) {
            throw Error("Scope does not exist");
        }

        if (urlToValidate?.startsWith(configForScope.allowedRedirectUrl)) {
            return true;
        }

        return false;
    }

    defaultMessage(): string {
        return `Scope does not exist`;
    }
}
