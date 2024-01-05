import { DynamicModule, Global, Module } from "@nestjs/common";

@Global()
@Module({})
export class CometBrevoModule {
    static register(): DynamicModule {
        return {
            module: CometBrevoModule,
            exports: [],
        };
    }
}
