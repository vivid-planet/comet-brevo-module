import cometConfig from "@src/comet-config.json";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";

import { EnvironmentVariables } from "./environment-variables";

export function createConfig(processEnv: NodeJS.ProcessEnv) {
    const envVars = plainToClass(EnvironmentVariables, { ...processEnv });
    const errors = validateSync(envVars, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return {
        ...cometConfig,
        debug: processEnv.NODE_ENV !== "production",
        serverHost: processEnv.SERVER_HOST ?? "localhost",
        helmRelease: envVars.HELM_RELEASE,
        apiUrl: envVars.API_URL,
        apiPort: envVars.API_PORT,
        corsAllowedOrigin: new RegExp(envVars.CORS_ALLOWED_ORIGIN),
        auth: {
            useAuthProxy: envVars.USE_AUTHPROXY,
            systemUserPassword: envVars.BASIC_AUTH_PASSWORD,
            idpJwksUri: envVars.IDP_JWKS_URI,
            idpEndSessionEndpoint: envVars.IDP_END_SESSION_ENDPOINT,
            postLogoutRedirectUri: envVars.POST_LOGOUT_REDIRECT_URI,
        },
        imgproxy: {
            ...cometConfig.imgproxy,
            salt: envVars.IMGPROXY_SALT,
            url: envVars.IMGPROXY_URL,
            key: envVars.IMGPROXY_KEY,
        },
        dam: {
            ...cometConfig.dam,
            secret: envVars.DAM_SECRET,
        },
        blob: {
            storage: {
                driver: envVars.BLOB_STORAGE_DRIVER,
                file: {
                    path: envVars.FILE_STORAGE_PATH,
                },
                azure: {
                    accountName: envVars.AZURE_ACCOUNT_NAME,
                    accountKey: envVars.AZURE_ACCOUNT_KEY,
                },
                s3: {
                    region: envVars.S3_REGION,
                    endpoint: envVars.S3_ENDPOINT,
                    bucket: envVars.S3_BUCKET,
                    credentials: {
                        accessKeyId: envVars.S3_ACCESS_KEY_ID,
                        secretAccessKey: envVars.S3_SECRET_ACCESS_KEY,
                    },
                },
            },
            storageDirectoryPrefix: envVars.BLOB_STORAGE_DIRECTORY_PREFIX,
        },
        brevo: {
            apiKey: envVars.BREVO_API_KEY,
            redirectUrlForImport: envVars.REDIRECT_URL_FOR_IMPORT,
        },
        campaign: {
            url: envVars.CAMPAIGN_URL,
            basicAuth: {
                username: envVars.CAMPAIGN_BASIC_AUTH_USERNAME,
                password: envVars.CAMPAIGN_BASIC_AUTH_PASSWORD,
            },
        },
        ecgRtrList: {
            apiKey: envVars.ECG_RTR_LIST_API_KEY,
        },
        contactsWithoutDoi: {
            allowAddingContactsWithoutDoi: envVars.ALLOW_ADDING_CONTACTS_WITHOUT_DOI,
            emailHashKey: envVars.EMAIL_HASH_KEY,
        },
        sitePreviewSecret: envVars.SITE_PREVIEW_SECRET,
    };
}

export type Config = ReturnType<typeof createConfig>;
