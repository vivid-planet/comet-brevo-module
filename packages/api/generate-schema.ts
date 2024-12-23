import { createOneOfBlock, createRichTextBlock, ExternalLinkBlock } from "@comet/blocks-api";
import {} from "@comet/cms-api";
import { Embeddable } from "@mikro-orm/core";
import { NestFactory } from "@nestjs/core";
import { Field, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, InputType, ObjectType } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import { createBrevoContactResolver } from "./src/brevo-contact/brevo-contact.resolver";
import { BrevoContactFactory } from "./src/brevo-contact/dto/brevo-contact.factory";
import { BrevoContactInputFactory } from "./src/brevo-contact/dto/brevo-contact-input.factory";
import { BrevoTestContactInputFactory } from "./src/brevo-contact/dto/brevo-test-contact-input.factory";
import { SubscribeInputFactory } from "./src/brevo-contact/dto/subscribe-input.factory";
import { EmailCampaignInputFactory } from "./src/email-campaign/dto/email-campaign-input.factory";
import { createEmailCampaignsResolver } from "./src/email-campaign/email-campaign.resolver";
import { EmailCampaignEntityFactory } from "./src/email-campaign/entities/email-campaign-entity.factory";
import { TargetGroupInputFactory } from "./src/target-group/dto/target-group-input.factory";
import { TargetGroupEntityFactory } from "./src/target-group/entity/target-group-entity.factory";
import { createTargetGroupsResolver } from "./src/target-group/target-group.resolver";
import { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "./src/types";

@ObjectType("EmailCampaignContentScope")
@InputType("EmailCampaignContentScopeInput")
class EmailCampaignScope implements EmailCampaignScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}

@Embeddable()
@ObjectType()
@InputType("BrevoContactFilterAttributesInput")
export class BrevoContactFilterAttributes implements BrevoContactFilterAttributesInterface {
    // index signature to match Array<any> | undefined in BrevoContactFilterAttributesInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Array<any> | undefined;

    @Field(() => [String], { nullable: true })
    thisFilterHasNoFields____?: string[]; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}

async function generateSchema(): Promise<void> {
    console.info("Generating schema.gql...");
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    const LinkBlock = createOneOfBlock(
        {
            supportedBlocks: { external: ExternalLinkBlock },
            allowEmpty: false,
        },
        "Link",
    );

    const EmailCampaignContentBlock = createOneOfBlock(
        { supportedBlocks: { internal: createRichTextBlock({ link: LinkBlock }) }, allowEmpty: true },
        "EmailCampaignContent",
    );

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

    const BrevoContact = BrevoContactFactory.create({});
    const [BrevoContactInput, BrevoContactUpdateInput] = BrevoContactInputFactory.create({ Scope: EmailCampaignScope });
    const [BrevoTestContactInput] = BrevoTestContactInputFactory.create({ Scope: EmailCampaignScope });

    const BrevoContactSubscribeInput = SubscribeInputFactory.create({ Scope: EmailCampaignScope });
    const BrevoContactResolver = createBrevoContactResolver({
        BrevoContact,
        BrevoContactSubscribeInput,
        Scope: EmailCampaignScope,
        BrevoContactInput,
        BrevoContactUpdateInput,
        BrevoTestContactInput,
    });

    const TargetGroup = TargetGroupEntityFactory.create({ Scope: EmailCampaignScope });
    const [TargetGroupInput, TargetGroupUpdateInput] = TargetGroupInputFactory.create({ BrevoFilterAttributes: BrevoContactFilterAttributes });
    const TargetGroupResolver = createTargetGroupsResolver({ TargetGroup, TargetGroupInput, TargetGroupUpdateInput, Scope: EmailCampaignScope });

    const EmailCampaign = EmailCampaignEntityFactory.create({ Scope: EmailCampaignScope, TargetGroup: TargetGroup, EmailCampaignContentBlock });
    const [EmailCampaignInput, EmailCampaignUpdateInput] = EmailCampaignInputFactory.create({ EmailCampaignContentBlock });
    const EmailCampaignResolver = createEmailCampaignsResolver({
        EmailCampaign,
        TargetGroup,
        EmailCampaignInput,
        EmailCampaignUpdateInput,
        Scope: EmailCampaignScope,
    });

    const schema = await gqlSchemaFactory.create([BrevoContactResolver, TargetGroupResolver, EmailCampaignResolver]);

    await writeFile("schema.gql", printSchema(schema));

    console.log("Done!");
}

generateSchema();
