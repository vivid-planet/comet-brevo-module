import { Injectable } from "@nestjs/common";
import { Command, Console } from "nestjs-console";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";

@Injectable()
@Console()
export class DeleteUnsubscribedContactsConsole {
    constructor(private readonly brevoApiContactsService: BrevoApiContactsService) {}

    @Command({
        command: "delete-unsubscribed-contacts",
        description: "deletes unsubscribed contacts",
    })
    async execute(): Promise<void> {
        let numberOfBlacklistedContacts = false;
        let offset = 0;
        const limit = 50;

        do {
            const contacts = await this.brevoApiContactsService.findContacts(limit, offset, { domain: "main", language: "en" });
            const blacklistedContacts = contacts.filter((contact) => contact.emailBlacklisted === true);

            if (blacklistedContacts.length > 0) {
                await this.brevoApiContactsService.deleteContacts(blacklistedContacts, { domain: "main", language: "en" });
            }

            numberOfBlacklistedContacts = contacts.length === limit;
            offset += limit;
        } while (numberOfBlacklistedContacts);
    }
}

// TODO: scope problem
