import { BrevoModule } from "@comet/brevo-api";
import {
    BlobStorageModule,
    BlocksModule,
    BlocksTransformerMiddlewareFactory,
    BuildsModule,
    DamModule,
    DependenciesModule,
    FileUploadsModule,
    KubernetesModule,
    PageTreeModule,
    RedirectsModule,
    UserPermissionsModule,
} from "@comet/cms-api";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { DynamicModule, Module } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Enhancer, GraphQLModule } from "@nestjs/graphql";
import { DbModule } from "@src/db/db.module";
import { Link } from "@src/documents/links/entities/link.entity";
import { LinksModule } from "@src/documents/links/links.module";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PagesModule } from "@src/documents/pages/pages.module";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";
import { FileUploadDummyModule } from "@src/workaround-remove-in-future/file-upload/file-upload-dummy.module";
import { ValidationError } from "apollo-server-express";
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
                GraphQLModule.forRootAsync<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    imports: [BlocksModule],
                    useFactory: (moduleRef: ModuleRef) => ({
                        debug: config.debug,
                        playground: config.debug,
                        autoSchemaFile: "schema.gql",
                        formatError: (error) => {
                            // Disable GraphQL field suggestions in production
                            if (process.env.NODE_ENV !== "development") {
                                if (error instanceof ValidationError) {
                                    return new ValidationError("Invalid request.");
                                }
                            }
                            return error;
                        },
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
                            fieldMiddleware: [BlocksTransformerMiddlewareFactory.create(moduleRef)],
                        },
                    }),
                    inject: [ModuleRef],
                }),
                authModule,
                UserPermissionsModule.forRootAsync({
                    useFactory: (accessControlService: AccessControlService) => ({
                        systemUsers: ["system-user"],
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
                BlocksModule,
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
                    sitePreviewSecret: config.sitePreviewSecret,
                }),
                RedirectsModule.register(),
                BlobStorageModule.register({
                    backend: config.blob.storage,
                }),
                DamModule.register({
                    File: DamFile,
                    Folder: DamFolder,
                    damConfig: {
                        apiUrl: config.apiUrl,
                        secret: config.dam.secret,
                        allowedImageSizes: config.dam.allowedImageSizes,
                        allowedAspectRatios: config.dam.allowedImageAspectRatios,
                        filesDirectory: `${config.blob.storageDirectoryPrefix}-files`,
                        cacheDirectory: `${config.blob.storageDirectoryPrefix}-cache`,
                        maxFileSize: config.dam.uploadsMaxFileSize,
                    },
                    imgproxyConfig: config.imgproxy,
                }),
                StatusModule,
                MenusModule,
                DependenciesModule,
                FileUploadsModule.register({
                    acceptedMimeTypes: ["text/csv"],
                    maxFileSize: config.fileUploads.maxFileSize,
                    directory: `${config.blob.storageDirectoryPrefix}-file-uploads`,
                }),
                BrevoModule.register({
                    brevo: {
                        resolveConfig: (scope: EmailCampaignContentScope) => {
                            // change config based on scope - for example different sender email
                            // this is just to show you can use the scope to change the config but it has no real use in this example
                            if (scope.domain === "main") {
                                return {
                                    apiKey: config.brevo.apiKey,
                                    allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                                };
                            } else {
                                return {
                                    apiKey: config.brevo.apiKey,
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
                FileUploadDummyModule,
            ],
        };
    }
}
