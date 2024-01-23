import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { TargetGroupInputFactory } from "./dto/target-group-input.factory";
import { TargetGroupEntityFactory } from "./entity/target-group-entity.factory";
import { createTargetGroupsResolver } from "./target-group.resolver";
import { TargetGroupsService } from "./target-groups.service";

interface TargetGroupModuleConfig {
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
}

@Module({})
export class TargetGroupModule {
    static register({ Scope, BrevoFilterAttributes }: TargetGroupModuleConfig): DynamicModule {
        const TargetGroup = TargetGroupEntityFactory.create({ Scope, BrevoFilterAttributes });
        const TargetGroupInput = TargetGroupInputFactory.create({ BrevoFilterAttributes });
        const TargetGroupResolver = createTargetGroupsResolver({ TargetGroup, TargetGroupInput, Scope });

        return {
            module: TargetGroupModule,
            imports: [ConfigModule, BrevoApiModule, MikroOrmModule.forFeature([TargetGroup])],
            providers: [TargetGroupResolver, TargetGroupsService],
            exports: [TargetGroupsService],
        };
    }
}
