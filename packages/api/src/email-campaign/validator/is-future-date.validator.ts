import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export const IsFutureDate = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsFutureDateConstraint,
        });
    };
};

@ValidatorConstraint({ name: "IsFutureDate" })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: Date | null | undefined): boolean {
        if (value === null || value === undefined) {
            return true; // Allow null/undefined values, use @IsNotEmpty() if required
        }

        if (!(value instanceof Date)) {
            return false;
        }

        return value >= new Date();
    }

    defaultMessage(): string {
        return "Date must not be in the past";
    }
}
