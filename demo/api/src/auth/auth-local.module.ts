import { createAuthResolver, createCometAuthGuard, createStaticAuthedUserStrategy, CurrentUser } from "@comet/cms-api";
import { DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Config } from "@src/config/config";

import { AccessControlService } from "./access-control.service";

@Module({})
export class AuthLocalModule {
    //does currently not use config, but might be one day
    static forRoot(config: Config): DynamicModule {
        if (process.env.NODE_ENV !== "development") {
            throw new Error("AuthLocalModule must only be used in development");
        }

        return {
            module: AuthLocalModule,
            providers: [
                createStaticAuthedUserStrategy({
                    staticAuthedUser: {
                        id: "10f266b8-ec2e-4a0c-98ec-2cfacceda1b7",
                        name: "Test Admin",
                        email: "demo@comet-dxp.com",
                    },
                }),
                createAuthResolver({
                    currentUser: CurrentUser,
                }),
                {
                    provide: APP_GUARD,
                    useClass: createCometAuthGuard(["static-authed-user"]),
                },
                AccessControlService,
            ],
            exports: [AccessControlService],
        };
    }
}
