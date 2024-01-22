import { Migration } from "@mikro-orm/migrations";

export class Migration20240118144808 extends Migration {
    // TODO: move to package and make dynamic
    async up(): Promise<void> {
        this.addSql(
            'create table "TargetGroup" ("id" uuid not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null, "title" text not null, "scope_domain" text not null, "scope_language" text not null, "brevoId" int not null, "filters_SALUTATION" text[] null, "isMainList" boolean);',
        );
        this.addSql('alter table "TargetGroup" add constraint "TargetGroup_pkey" primary key ("id");');
    }
}
