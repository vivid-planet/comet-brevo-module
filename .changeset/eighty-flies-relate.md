---
"@comet/brevo-api": major
---

Basic migrations for EmailCampaign and TargetGroup are now available in the module directly.

They must be imported into the project and added to the `migrationsList` in the `ormConfig`. Migrations for adding the `scope` and `filters` must still be done in the project's migrations.

```diff
export const ormConfig = createOrmConfig({
    // ...
    migrations: {
        // ...
-       migrationsList: createMigrationsList(path.resolve(__dirname, "migrations")),
+       migrationsList: [...brevoMigrationsList, ...createMigrationsList(path.resolve(__dirname, "migrations"))],
    },
});

```

**Breaking Changes**:

-   Requires adaption of the project's migrations
