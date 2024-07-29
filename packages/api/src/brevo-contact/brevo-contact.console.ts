import { CreateRequestContext, MikroORM } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Command, Console } from "nestjs-console";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { TargetGroupsService } from "../target-group/target-groups.service";

@Injectable()
@Console()
export class DeleteUnsubscribedContactsConsole {
    constructor(
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly targetGroupsService: TargetGroupsService,
        private readonly orm: MikroORM,
    ) {}

    @Command({
        command: "delete-unsubscribed-contacts",
        description: "deletes unsubscribed contacts",
    })
    @CreateRequestContext()
    async execute(): Promise<void> {
        const offset = 0;
        const limit = 50;
        const where = { isMainList: true };

        const [targetGroups] = await this.targetGroupsService.findTargetGroups({ offset, limit, where });

        for (const targetGroup of targetGroups) {
            let hasMoreContacts = false;
            let offset = 0;

            do {
                const contacts = await this.brevoApiContactsService.findContacts(limit, offset, {
                   scope: targetGroup.scope
                });

                const blacklistedContacts = contacts.filter((contact) => contact.emailBlacklisted === true);

                if (blacklistedContacts.length > 0) {
                    await this.brevoApiContactsService.deleteContacts(blacklistedContacts, { scope: targetGroup.scope}
                    );
                }

                hasMoreContacts = contacts.length > limit;
                offset += limit;
            } while (hasMoreContacts);
        }
    }
}
