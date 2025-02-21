import { Migration } from "@mikro-orm/migrations";

export class Migration20250221074620 extends Migration {
    // this migration needs to be generated manually
    async up(): Promise<void> {
        this.addSql(
            `alter table "BrevoConfig" add column "scope_domain" text not null default 'main', add column "scope_language" text not null default 'en';`,
        );
        this.addSql(`alter table "BrevoConfig" alter column "scope_domain" drop default, alter column "scope_language" drop default;`);
    }
}
