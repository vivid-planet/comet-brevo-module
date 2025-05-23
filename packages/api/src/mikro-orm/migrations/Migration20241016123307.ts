import { Migration } from "@mikro-orm/migrations";

export class Migration20241016123307 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "BrevoConfig" ("id" uuid not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null, "scope_domain" text not null, "scope_language" text not null, "senderMail" text not null, "senderName" text not null, constraint "BrevoConfig_pkey" primary key ("id"));',
        );
    }
}
