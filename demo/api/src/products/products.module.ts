import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { Product } from "./entities/product.entity";
import { ProductCrudResolver } from "./product.crud.resolver";
import { ProductsConsole } from "./products.console";
import { ProductsService } from "./products.service";

@Module({
    imports: [MikroOrmModule.forFeature([Product])],
    providers: [ProductsService, ProductCrudResolver, ProductsConsole],
    exports: [ProductsService],
})
export class ProductsModule {}
