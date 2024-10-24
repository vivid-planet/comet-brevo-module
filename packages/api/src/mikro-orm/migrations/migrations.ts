import { MigrationObject } from "@mikro-orm/core";

import { Migration20240115095733 } from "./Migration20240115095733";
import { Migration20240118144808 } from "./Migration20240118144808";
import { Migration20240123145606 } from "./Migration20240123145606";
import { Migration20240527112204 } from "./Migration20240527112204";
import { Migration20240619092554 } from "./Migration20240619092554";
import { Migration20240619145217 } from "./Migration20240619145217";
import { Migration20240621102349 } from "./Migration20240621102349";
import { Migration20240819214939 } from "./Migration20240819214939";
import { Migration20241016123307 } from "./Migration20241016123307";

export const migrationsList: MigrationObject[] = [
    { name: "Migration20240115095733", class: Migration20240115095733 },
    { name: "Migration20240118144808", class: Migration20240118144808 },
    { name: "Migration20240123145606", class: Migration20240123145606 },
    { name: "Migration20240527112204", class: Migration20240527112204 },
    { name: "Migration20240619092554", class: Migration20240619092554 },
    { name: "Migration20240619145217", class: Migration20240619145217 },
    { name: "Migration20240621102349", class: Migration20240621102349 },
    { name: "Migration20240819214939", class: Migration20240819214939 },
    { name: "Migration20241016123307", class: Migration20241016123307 },
];
