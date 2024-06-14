import { Migration } from "@mikro-orm/migrations";

export class Migration20240614084655 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "BrevoConfig" alter column "senderMail" drop not null;');
        this.addSql('alter table "BrevoConfig" alter column "senderName" drop not null;');
        this.addSql('alter table "BrevoConfig" add column "doiTemplateId" int;');
        this.addSql('alter table "BrevoConfig" add column "apiKey" text;');
    }
}
