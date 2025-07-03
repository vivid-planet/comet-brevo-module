import { Migration } from "@mikro-orm/migrations";

export class Migration20250703155205 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "EmailCampaign" rename to "BrevoEmailCampaign";');
        this.addSql('alter table "BlacklistedContacts" rename to "BrevoBlacklistedContacts";');
        this.addSql('alter table "TargetGroup" rename to "BrevoTargetGroups";');
    }
}
