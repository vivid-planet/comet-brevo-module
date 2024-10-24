import { Migration } from "@mikro-orm/migrations";

export class Migration20241024075236 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "EmailCampaign" add column "unsubscriptionPageId" text null;');
    }
}
