import { createAuthProxyJwtStrategy, createAuthResolver, createCometAuthGuard, createStaticCredentialsBasicStrategy } from "@comet/cms-api";
import { DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Config } from "@src/config/config";

import { AccessControlService } from "./access-control.service";

@Module({})
export class AuthModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: AuthModule,
            providers: [
                createStaticCredentialsBasicStrategy({
                    username: "vivid",
                    password: config.auth.basicAuthPassword,
                    strategyName: "system-user",
                }),
                createAuthProxyJwtStrategy({
                    jwksUri: config.auth.idpJwksUri,
                }),
                createAuthResolver({
                    endSessionEndpoint: config.auth.idpEndSessionEndpoint,
                    postLogoutRedirectUri: config.auth.postLogoutRedirectUri,
                }),
                {
                    provide: APP_GUARD,
                    useClass: createCometAuthGuard(["auth-proxy-jwt", "system-user"]),
                },
                AccessControlService,
            ],
            exports: [AccessControlService],
        };
    }
}
