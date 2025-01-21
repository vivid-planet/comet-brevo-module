# @comet/brevo-api

## 2.2.0

### Minor Changes

-   f07d79a: Adds `createBrevoTestContactsPage` for creating a test contacts page, that is indepent from the main list.

    Remove `email` and `redirectionUrl` from `brevoContactsPageAttributesConfig`

-   ada83cf: Add filter for `sendingState` in `EmailCampaignsGrid`
-   dd93185: Add `BREVO_FOLDER_ID` to environment variables to allow overwriting default value `1`

## 2.1.6

### Patch Changes

-   be6d19b: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.1.5

### Patch Changes

-   54b8858: Add `@nestjs/core` as a peer dependency. It should have been included as a peer dependency from the beginning.

## 2.1.4

### Patch Changes

-   cc296b4: Remove peerDependency for axios. Axios is not needed anymore.

## 2.1.3

### Patch Changes

-   3c5b342: Fix brevo error handling error

    Fix brevo error handling causing contact import to fail if contact does not exists in brevo yet

## 2.1.2

### Patch Changes

-   e6dc804: Handle brevo errors explicitly to improve error messages
-   f675cd0: CSV Import Validation Improvements and Bug Fix

    Add better validation for csv imports.

    Add better feedback after a csv import when something goes wrong. User can download a file with failing rows.

    Fix a bug when importing via csv in a targetgroup. The contact was only added to the manually assigned contacts and not to the actual target group.

-   acffd63: Support multiselect values in contact import

    Previously the contact import did not support multiselect values since brevo expects an array of values and the csv import only sent values as strings. Now the import value gets transformed to an array in case the contact attribute should be of type array. The value in the csv file's column needs to be separated with a comma in case of multiple selected values.

## 2.1.1

### Patch Changes

-   06d4132: Add check for arrays in `checkIfContactIsInTargetGroup` function, to check if at least one `contactAttribute` is included in the filter.

## 2.1.0

### Minor Changes

-   3606421: Brevo returns a 404 error when an email address is not found and a 400 error if an invalid email is provided. Instead of handling only one of these errors, both status codes must be ignored to prevent the contact search from throwing an error.

## 2.0.2

### Patch Changes

-   06c18b7: Fix campaign statistics

    Addressed an issue where the globalStats property was being used to retrieve campaign stats, but it wasn’t working as expected. We now use the campaignStats property instead, which returns a list. The first value from this list is now used to show accurate campaign statistics.

-   b1cff9b: Fix searching contacts

    Previously, Brevo returned a 400 error when an email address was not found. The implementation has been updated to correctly handle the 404 status code instead of 400. As a result, the contact search functionality now works as expected without throwing an error when no matching email address is found.

## 2.0.1

### Patch Changes

-   799366c: Prevent invisible blocks from being included in the newsletter

## 2.0.0

### Major Changes

-   7461c8b: Basic migrations for EmailCampaign and TargetGroup are now available in the module directly.

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

-   6b5b9a4: The `allowedRedirectUrl` must now be configured within the resolveConfig for each specific scope, instead of being set once for all scopes in the brevo config.

    ```diff
       BrevoModule.register({
                        brevo: {
                            resolveConfig: (scope: EmailCampaignContentScope) => {
                                // change config based on scope - for example different sender email
                                // this is just to show you can use the scope to change the config but it has no real use in this example
                                if (scope.domain === "main") {
                                    return {
                                        apiKey: config.brevo.apiKey,
                                        doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                        sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                                   allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    };
                                } else {
                                    return {
                                        apiKey: config.brevo.apiKey,
                                        doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                        sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                                   allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    };
                                }
                            },
                            BrevoContactAttributes,
                            BrevoContactFilterAttributes,
    -                       allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                        },
        })
    ```

-   166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:

    -   Now requires >= v6.0.0 for `@comet` packages
    -   All GraphQL resolvers now require the `brevo-newsletter` permission.
    -   `BrevoContactResolver#subscribeBrevoContact` mutation: The `scope` argument was moved outside `input` to enable an automatic scope check
    -   `BrevoContactsService#createDoubleOptInContact`: `scope` was moved outside `data` and is now the second argument
    -   `TargetGroupsService#findNonMainTargetGroups`: `data` was replaced with `scope`

-   aae0de4: Add `redirectUrlForImport` to `BrevoModule` config

    You must now pass a `redirectUrlForImport` to your `BrevoModule` config:

    ```ts
    BrevoModule.register({
        brevo: {
            resolveConfig: (scope: EmailCampaignContentScope) => {
                return {
                    // ...
                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                };
            },
        },
    });
    ```

    The `redirectUrlForImport` will usually be the site URL of a scope. It is used by the CSV contact import as redirect target after the user completes the double opt-in.

-   b254b38: Removes the brevo config page, `createBrevoConfigPage` is no longer available.

    ```diff
    -    const BrevoConfigPage = createBrevoConfigPage({
    -        scopeParts: ["domain", "language"],
    -    });
    ```

    Brevo config now must be set in the api brevo module initialization and can be adjusted depending on the scope.
    Scope argument was added to resolver and service functions to ensure the correct config is used for passed scope.

    ```diff
        BrevoModule.register({
            brevo: {
    +           resolveConfig: (scope: EmailCampaignContentScope) => {
    +               if (scope.domain === "main") {
    +                   return {
    +                       apiKey: config.brevo.apiKey,
    +                       doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
    +                       sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                   };
    +               } else {
    +                   return {
    +                       apiKey: config.brevo.otherApiKey,
    +                       doubleOptInTemplateId: config.brevo.otherDoubleOptInTemplateId,
    +                       sender: { name: config.brevo.otherSender.name, email: config.brevo.otherSender.email },
    +                   };
    +               }
    +           },
                // ...
            },
        })
    ```

### Minor Changes

-   d21db92: Add `DeleteUnsubscribedBrevoContactsConsole` job to enable the deletion of blocklisted contacts. This job can be utilized as a cronjob to periodically clean up the blocklisted contacts.
-   31f1241: Export `BrevoContactsService` so that it can be used in the application

    This allows, for example, adding a custom REST request in the application to subscribe to the newsletter. The application should then add reCAPTCHA before calling the BrevoContactsService to prevent problems with bots.

-   e774ecb: Allow manually assigning contacts to a target group

    This is in addition to the existing automatic assignment via filters.

-   34beaac: All assigned contacts are now displayed in a datagrid on the target group edit admin page.
-   6cf6252: Add scope to the preview state so it can be accessed in the preview page if necessary
-   aae0de4: Add functionality to import Brevo contacts from CSV files

    You can import CSV files via the Admin interface or via CLI command.

    **Note:** For the import to work, you must provide a `redirectUrlForImport` to the `BrevoModule` in the API and an `apiUrl` to the `BrevoConfigProvider` in the admin. See the respective changelog entries for more information.

    CLI command:

    ```bash
    npm run --prefix api console import-brevo-contacts -- -p <path-to-csv-file> -s '<scope-json>' [--targetGroupIds <ids...>]

    // Example:
    npm run --prefix api console import-brevo-contacts -- -p test_contacts_import.csv -s '{"domain": "main", "language":"de"}' --targetGroupIds 2618c982-fdf8-4cab-9811-a21d3272c62c,c5197539-2529-48a7-9bd1-764e9620cbd2
    ```

-   3f3fdeb: Add and export `BrevoTransactionalMailsService` that can be used in the application for sending transactional mails.

    **Example Usage of `BrevoTransactionalMailsService`**

    ```typescript
    constructor(private readonly brevoTransactionalMailsService: BrevoTransactionalMailsService) {}

    async send(email: string, htmlContent: string, subject: string): Promise<void> {
        await this.brevoTransactionalMailsService.send({ to: [{ email }], htmlContent, subject }, data.scope);
    }
    ```

-   f7c0fdd: Allow sending a campaign to multiple target groups
-   42746b1: Add an edit page for brevo contacts
    It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

    ```diff
        createBrevoContactsPage({
             //...
    +        additionalFormFields: brevoContactConfig.additionalFormFields,
    +        input2State: brevoContactConfig.input2State,
        });
    ```

-   3407537: Add `id` to the POST request to the mailing frontend, enabling applications to use the `id` to generate a `browserUrl` for rendering the email in a web browser.
-   44fcc6c: A required brevo config page must now be generated with `createBrevoConfigPage`.
    All necessary brevo configuration (for each scope) must be configured within this page for emails campaigns to be sent.

    ```diff
    + const BrevoConfigPage = createBrevoConfigPage({
    +        scopeParts: ["domain", "language"],
    + });
    ```

    Env vars containing the brevo sender information can be removed.

    ```diff
    - BREVO_SENDER_NAME=senderName
    - BREVO_SENDER_EMAIL=senderEmail
    ```

### Patch Changes

-   42746b1: Fix bug that does not add the contact to all target groups when subscribing
