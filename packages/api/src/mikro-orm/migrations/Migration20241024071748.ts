import { Migration } from "@mikro-orm/migrations";

export class Migration20241024071748 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "BrevoConfig" add column "unsubscriptionPageId" text null;');
        this.addSql('alter table "EmailCampaign" add column "unsubscriptionPageId" text null;');
    }
}
