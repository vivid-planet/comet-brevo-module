import { Migration } from "@mikro-orm/migrations";

export class Migration20250321145521 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "BlacklistedContacts" add column "scope_domain" text not null, add column "scope_language" text not null;');
    }
}
