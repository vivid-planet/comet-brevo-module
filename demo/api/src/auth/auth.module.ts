import {
    CometAuthGuard,
    createAuthGuardProviders,
    createBasicAuthService,
    createJwtAuthService,
    createSitePreviewAuthService,
    createStaticUserAuthService,
} from "@comet/cms-api";
import { DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "@src/config/config";

import { AccessControlService } from "./access-control.service";
import { staticUsers } from "./static-users";

@Module({})
export class AuthModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: AuthModule,
            providers: [
                ...createAuthGuardProviders(
                    createBasicAuthService({
                        username: "vivid",
                        password: config.auth.basicAuthPassword,
                    }),
                    createJwtAuthService({
                        jwksOptions: {
                            jwksUri: config.auth.idpJwksUri,
                        },
                    }),
                    createStaticUserAuthService({
                        staticUser: staticUsers[0],
                    }),
                    createSitePreviewAuthService({ sitePreviewSecret: config.sitePreviewSecret }),
                ),
                {
                    provide: APP_GUARD,
                    useClass: CometAuthGuard,
                },
                AccessControlService,
            ],
            exports: [AccessControlService],
            imports: [JwtModule],
        };
    }
}
