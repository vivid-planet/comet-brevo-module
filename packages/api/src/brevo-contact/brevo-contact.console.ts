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

        const [targetGroups] = await this.targetGroupsService.findMainTargetGroups({ offset, limit, where });

        for (const targetGroup of targetGroups) {
            let numberOfBlacklistedContacts = false;
            let offset = 0;

            do {
                const contacts = await this.brevoApiContactsService.findContacts(limit, offset, {
                    domain: targetGroup.scope.domain,
                    language: targetGroup.scope.language,
                });

                const blacklistedContacts = contacts.filter((contact) => contact.emailBlacklisted === true);

                if (blacklistedContacts.length > 0) {
                    await this.brevoApiContactsService.deleteContacts(blacklistedContacts, {
                        domain: "main",
                        language: "en",
                    });
                }

                numberOfBlacklistedContacts = contacts.length === limit;
                offset += limit;
            } while (numberOfBlacklistedContacts);
        }
    }
}
