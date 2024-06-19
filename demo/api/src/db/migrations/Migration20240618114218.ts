import { Migration } from "@mikro-orm/migrations";

export class Migration20240618114218 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "TargetGroup" add column "associatedTargetGroup" uuid null;');
        this.addSql(
            'alter table "TargetGroup" add constraint "TargetGroup_associatedTargetGroup_foreign" foreign key ("associatedTargetGroup") references "TargetGroup" ("id") on update cascade on delete cascade;',
        );
        this.addSql('alter table "TargetGroup" add constraint "TargetGroup_associatedTargetGroup_unique" unique ("associatedTargetGroup");');
    }
}
