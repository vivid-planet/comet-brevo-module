import { Inject, Injectable } from "@nestjs/common";
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { BrevoModuleConfig } from "../../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants";

export const IsValidRedirectURL = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRedirectURLConstraint,
            constraints: [],
        });
    };
};

@ValidatorConstraint({ name: "IsValidRedirectURL", async: true })
@Injectable()
export class IsValidRedirectURLConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    async validate(urlToValidate: string): Promise<boolean> {
        if (urlToValidate?.startsWith(this.config.brevo.allowedRedirectUrl)) {
            return true;
        }
        return false;
    }

    defaultMessage(): string {
        return `URL is not supported`;
    }
}
