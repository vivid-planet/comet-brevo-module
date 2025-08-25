import { CreateRequestContext, MikroORM } from "@mikro-orm/core";
import { Logger } from "@nestjs/common";
import { MultiBar, Options, Presets } from "cli-progress";
import { Command, CommandRunner } from "nest-commander";

@Command({
    name: "fixtures [total]",
    arguments: "<total>",
    description: "Create fixtures with faker.js",
})
export class FixturesConsole extends CommandRunner {
    private readonly logger = new Logger(FixturesConsole.name);

    constructor(private readonly orm: MikroORM) {
        super();
    }

    barOptions: Options = {
        format: `{bar} {percentage}% | {value}/{total} {title} | ETA: {eta_formatted} | Duration: {duration_formatted}`,
        noTTYOutput: true,
    };

    @CreateRequestContext()
    async run([total]: string[] | number[]): Promise<void> {
        total = total === undefined ? 10 : Number(total);

        this.logger.log(`Drop tables...`);
        const connection = this.orm.em.getConnection();

        const tables = await connection.execute(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;`);

        for (const table of tables) {
            await connection.execute(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
        }

        this.logger.log(`Run migrations...`);
        const migrator = this.orm.getMigrator();
        await migrator.up();

        const multiBar = new MultiBar(this.barOptions, Presets.shades_classic);
        multiBar.stop();

        await this.orm.em.flush();
    }
}
