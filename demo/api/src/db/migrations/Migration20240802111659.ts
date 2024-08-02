import { Migration } from "@mikro-orm/migrations";

export class Migration20240802111659 extends Migration {
    // TODO: should this be generated automatically by the migration generator? currently needs to be added manually
    // TODO: must entity generation be done like the pagetreenode in comet? currently it is done like redirect
    async up(): Promise<void> {
        this.addSql('alter table "EmailCampaign" add column "scope_domain" text not null, add column "scope_language" text not null;');
        this.addSql(
            'alter table "TargetGroup" add column "scope_domain" text not null, add column "scope_language" text not null, add column "filters_SALUTATION" text[] null;',
        );
    }
}
