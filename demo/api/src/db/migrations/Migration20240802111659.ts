import { Migration } from "@mikro-orm/migrations";

export class Migration20240802111659 extends Migration {
    // this migration needs to be generated manually
    async up(): Promise<void> {
        this.addSql('alter table "EmailCampaign" add column "scope_domain" text not null, add column "scope_language" text not null;');
        this.addSql(
            'alter table "TargetGroup" add column "scope_domain" text not null, add column "scope_language" text not null, add column "filters_SALUTATION" text[] null;',
        );
    }
}
