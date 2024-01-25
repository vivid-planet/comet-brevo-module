import { NestFactory } from "@nestjs/core";
import { Field, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, InputType, ObjectType } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import { createBrevoContactResolver } from "./src/brevo-contact/brevo-contact.resolver";
import { BrevoContactFactory } from "./src/brevo-contact/dto/brevo-contact.factory";
import { SubscribeInputFactory } from "./src/brevo-contact/dto/subscribe-input.factory";
import { EmailCampaignScopeInterface } from "./src/types";

@ObjectType("EmailCampaignContentScope")
@InputType("EmailCampaignContentScopeInput")
class EmailCampaignScope implements EmailCampaignScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}

async function generateSchema(): Promise<void> {
    console.info("Generating schema.gql...");
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

    const BrevoContact = BrevoContactFactory.create({});
    const BrevoContactSubscribeInput = SubscribeInputFactory.create({ Scope: EmailCampaignScope });
    const BrevoContactResolver = createBrevoContactResolver({ BrevoContact, BrevoContactSubscribeInput, Scope: EmailCampaignScope });

    const schema = await gqlSchemaFactory.create([BrevoContactResolver]);

    await writeFile("schema.gql", printSchema(schema));

    console.log("Done!");
}

generateSchema();
