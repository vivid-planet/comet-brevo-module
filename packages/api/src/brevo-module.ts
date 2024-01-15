import { DynamicModule, Global, Module } from "@nestjs/common";

@Global()
@Module({})
export class BrevoModule {
    static register(): DynamicModule {
        return {
            module: BrevoModule,
            exports: [],
        };
    }
}
