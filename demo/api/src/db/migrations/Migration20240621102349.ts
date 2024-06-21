import { Migration } from "@mikro-orm/migrations";

export class Migration20240621102349 extends Migration {
    async up(): Promise<void> {
        // TODO: what to do with existing data -> should not be null i guess
        this.addSql(
            "alter table \"EmailCampaign\" add column \"sendingState\" text check (\"sendingState\" in ('DRAFT', 'SENT', 'SENDING', 'SCHEDULED')) null;",
        );
    }
}
