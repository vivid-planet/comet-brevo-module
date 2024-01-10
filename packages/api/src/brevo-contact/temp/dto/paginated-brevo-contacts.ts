import { PaginatedResponseFactory } from "@comet/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { BrevoContact } from "../../entity/brevo-contact.entity";

@ObjectType()
export class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}
