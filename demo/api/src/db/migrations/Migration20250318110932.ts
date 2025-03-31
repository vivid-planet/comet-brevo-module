import { Migration } from "@mikro-orm/migrations";

export class Migration20250318110932 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "BrevoContactLog"  add column "scope_domain" text not null, add column "scope_language" text not null;');
    }
}
