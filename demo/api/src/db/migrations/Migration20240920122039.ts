import { Migration } from "@mikro-orm/migrations";

export class Migration20240920122039 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "TargetGroup" add column "filters_BRANCH" text[] null;');
    }
}
