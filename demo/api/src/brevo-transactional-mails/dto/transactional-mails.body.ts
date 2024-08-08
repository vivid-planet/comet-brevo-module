import { EmailContactSubscribeScope } from "@src/brevo-contact/dto/brevo-contact-subscribe.scope";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class BrevoTransactionalMailsBody {
    @IsString()
    subject: string;

    @IsString()
    text: string;

    @IsEmail()
    to: string;

    @ValidateNested()
    @Type(() => EmailContactSubscribeScope)
    @IsNotEmpty()
    scope: EmailContactSubscribeScope;
}
