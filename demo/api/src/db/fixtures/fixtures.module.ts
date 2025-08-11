import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FixturesConsole } from "@src/db/fixtures/fixtures.console";

@Module({
    imports: [ConfigModule],
    providers: [FixturesConsole],
    exports: [],
})
export class FixturesModule {}
