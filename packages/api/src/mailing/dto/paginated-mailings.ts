import { PaginatedResponseFactory } from "@comet/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { Mailing } from "../../entities/mailing.entity";

@ObjectType()
export class PaginatedMailings extends PaginatedResponseFactory.create(Mailing) {}
