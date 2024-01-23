import { NestFactory } from "@nestjs/core";
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import { createBrevoContactResolver } from "./src/brevo-contact/brevo-contact.resolver";
import { BrevoContactFactory } from "./src/brevo-contact/dto/brevo-contact.factory";
import { SubscribeInputFactory } from "./src/brevo-contact/dto/subscribe-input.factory";

async function generateSchema(): Promise<void> {
    console.info("Generating schema.gql...");
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

    const BrevoContact = BrevoContactFactory.create({});
    const BrevoContactSubscribeInput = SubscribeInputFactory.create({});
    const BrevoContactResolver = createBrevoContactResolver({ BrevoContact, BrevoContactSubscribeInput });

    const schema = await gqlSchemaFactory.create([BrevoContactResolver]);

    await writeFile("schema.gql", printSchema(schema));

    console.log("Done!");
}

generateSchema();
