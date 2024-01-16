import { PaginatedResponseFactory } from "@comet/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { BrevoContact } from "./brevo-contact";

@ObjectType()
export class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}
