import { Options } from "@mikro-orm/core";

import { ormConfig } from "./ormconfig";

const config: Options = {
    ...ormConfig,
    entities: ["./dist/**/*.entity.js"],
    entitiesTs: ["./src/**/*.entity.ts"],
};

export = config;
