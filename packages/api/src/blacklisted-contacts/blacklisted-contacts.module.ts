import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BlacklistedContactsService } from "./blacklisted-contacts.service";
import { BlacklistedContactsInterface } from "./entity/blacklisted-contacts.entity.factory";

interface BlacklistedContactsModuleConfig {
    BlacklistedContacts?: Type<BlacklistedContactsInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}

@Module({})
export class BlacklistedContactsModule {
    static register({ BlacklistedContacts }: BlacklistedContactsModuleConfig): DynamicModule {
        return {
            module: BlacklistedContactsModule,
            imports: BlacklistedContacts ? [MikroOrmModule.forFeature([BlacklistedContacts])] : [],
            providers: BlacklistedContacts ? [BlacklistedContactsService] : [],
            exports: BlacklistedContacts ? [BlacklistedContactsService] : [],
        };
    }
}
