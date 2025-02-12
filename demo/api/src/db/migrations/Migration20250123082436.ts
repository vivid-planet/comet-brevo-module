import { Migration } from "@mikro-orm/migrations";
import { v4 } from "uuid";

export class Migration20250123082436 extends Migration {
    async up(): Promise<void> {
        const id = v4();

        this.addSql(`
        insert into "BrevoConfig" (
            "id", "createdAt", "updatedAt", "scope_domain", "scope_language", "senderMail", "senderName", "doubleOptInTemplateId", "allowedRedirectionUrl", "unsubscriptionPageId", "folderId"
        ) values (
          '${id}', now(), now(), 'main', 'en', '', '', 1, '', '', 457 
        );
    `);
    }
}
