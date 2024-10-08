import { BrevoModule } from "@comet/brevo-api";
import {
    BlobStorageModule,
    BLOCKS_MODULE_TRANSFORMER_DEPENDENCIES,
    BlocksModule,
    BlocksTransformerMiddlewareFactory,
    BuildsModule,
    DamModule,
    DependenciesModule,
    FilesService,
    ImagesService,
    KubernetesModule,
    PageTreeModule,
    PageTreeService,
    RedirectsModule,
    UserPermissionsModule,
} from "@comet/cms-api";
import { ApolloDriver } from "@nestjs/apollo";
import { DynamicModule, Module } from "@nestjs/common";
import { Enhancer, GraphQLModule } from "@nestjs/graphql";
import { DbModule } from "@src/db/db.module";
import { Link } from "@src/documents/links/entities/link.entity";
import { LinksModule } from "@src/documents/links/links.module";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PagesModule } from "@src/documents/pages/pages.module";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";
import { Request } from "express";

import { AccessControlService } from "./auth/access-control.service";
import { AuthModule } from "./auth/auth.module";
import { AuthLocalModule } from "./auth/auth-local.module";
import { BrevoContactSubscribeModule } from "./brevo-contact/brevo-contact-subscribe.module";
import { BrevoContactAttributes, BrevoContactFilterAttributes } from "./brevo-contact/dto/brevo-contact-attributes";
import { BrevoTransactionalMailsModule } from "./brevo-transactional-mails/brevo-transactional-mails.module";
import { Config } from "./config/config";
import { ConfigModule } from "./config/config.module";
import { DamFile } from "./dam/entities/dam-file.entity";
import { DamFolder } from "./dam/entities/dam-folder.entity";
import { EmailCampaignContentBlock } from "./email-campaign/blocks/email-campaign-content.block";
import { EmailCampaignContentScope } from "./email-campaign/email-campaign-content-scope";
import { MenusModule } from "./menus/menus.module";
import { StatusModule } from "./status/status.module";

@Module({})
export class AppModule {
    static forRoot(config: Config): DynamicModule {
        const authModule = config.auth.useAuthProxy ? AuthModule.forRoot(config) : AuthLocalModule.forRoot(config);

        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot(config),
                DbModule,
                GraphQLModule.forRootAsync({
                    driver: ApolloDriver,
                    imports: [BlocksModule],
                    useFactory: (dependencies: Record<string, unknown>) => ({
                        debug: config.debug,
                        playground: config.debug,
                        autoSchemaFile: "schema.gql",
                        context: ({ req }: { req: Request }) => ({ ...req }),
                        cors: {
                            origin: config.corsAllowedOrigin,
                            methods: ["GET", "POST"],
                            credentials: false,
                            exposedHeaders: [],
                        },
                        useGlobalPrefix: true,
                        // See https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
                        fieldResolverEnhancers: ["guards", "interceptors", "filters"] as Enhancer[],
                        buildSchemaOptions: {
                            fieldMiddleware: [BlocksTransformerMiddlewareFactory.create(dependencies)],
                        },
                    }),
                    inject: [BLOCKS_MODULE_TRANSFORMER_DEPENDENCIES],
                }),
                authModule,
                UserPermissionsModule.forRootAsync({
                    useFactory: (accessControlService: AccessControlService) => ({
                        availableContentScopes: [
                            { domain: "main", language: "en" },
                            { domain: "main", language: "de" },
                            { domain: "secondary", language: "en" },
                            { domain: "secondary", language: "de" },
                        ],
                        accessControlService,
                    }),
                    inject: [AccessControlService],
                    imports: [authModule],
                }),
                BlocksModule.forRoot({
                    imports: [PageTreeModule, DamModule],
                    useFactory: (pageTreeService: PageTreeService, filesService: FilesService, imagesService: ImagesService) => {
                        return {
                            transformerDependencies: {
                                pageTreeService,
                                filesService,
                                imagesService,
                            },
                        };
                    },
                    inject: [PageTreeService, FilesService, ImagesService],
                }),
                KubernetesModule.register({
                    helmRelease: config.helmRelease,
                }),
                BuildsModule,
                LinksModule,
                PagesModule,
                PageTreeModule.forRoot({
                    PageTreeNode: PageTreeNode,
                    Documents: [Page, Link],
                    Scope: PageTreeNodeScope,
                }),
                RedirectsModule.register(),
                BlobStorageModule.register({
                    backend: config.blob.storage,
                }),
                DamModule.register({
                    File: DamFile,
                    Folder: DamFolder,
                    damConfig: {
                        filesBaseUrl: `${config.apiUrl}/dam/files`,
                        imagesBaseUrl: `${config.apiUrl}/dam/images`,
                        secret: config.dam.secret,
                        allowedImageSizes: config.dam.allowedImageSizes,
                        allowedAspectRatios: config.dam.allowedImageAspectRatios,
                        additionalMimeTypes: config.dam.additionalMimeTypes,
                        filesDirectory: `${config.blob.storageDirectoryPrefix}-files`,
                        cacheDirectory: `${config.blob.storageDirectoryPrefix}-cache`,
                        maxFileSize: config.dam.uploadsMaxFileSize,
                    },
                    imgproxyConfig: config.imgproxy,
                }),
                StatusModule,
                MenusModule,
                DependenciesModule,
                BrevoModule.register({
                    brevo: {
                        resolveConfig: (scope: EmailCampaignContentScope) => {
                            // change config based on scope - for example different sender email
                            // this is just to show you can use the scope to change the config but it has no real use in this example
                            if (scope.domain === "main") {
                                return {
                                    apiKey: config.brevo.apiKey,
                                    doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                    sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
                                    allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                                };
                            } else {
                                return {
                                    apiKey: config.brevo.apiKey,
                                    doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                    sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
                                    allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                                };
                            }
                        },
                        BrevoContactAttributes,
                        BrevoContactFilterAttributes,
                    },
                    ecgRtrList: {
                        apiKey: config.ecgRtrList.apiKey,
                    },
                    emailCampaigns: {
                        EmailCampaignContentBlock,
                        Scope: EmailCampaignContentScope,
                        frontend: {
                            url: config.campaign.url,
                            basicAuth: {
                                username: config.campaign.basicAuth.username,
                                password: config.campaign.basicAuth.password,
                            },
                        },
                    },
                }),
                BrevoContactSubscribeModule,
                BrevoTransactionalMailsModule,
            ],
        };
    }
}
