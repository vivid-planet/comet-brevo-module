import { PaginatedResponseFactory } from "@comet/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { BrevoContact } from "./brevo-contact";

@ObjectType()
export class PaginatedBrevoContact extends PaginatedResponseFactory.create(BrevoContact) {}
