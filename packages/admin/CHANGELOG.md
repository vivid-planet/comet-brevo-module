# @comet/brevo-admin

## 2.2.0

### Minor Changes

-   f07d79a: Adds `createBrevoTestContactsPage` for creating a test contacts page, that is indepent from the main list.

    Remove `email` and `redirectionUrl` from `brevoContactsPageAttributesConfig`

-   d32e9e8: Replace the `TextField` with a `FinalFormSelect` component in the `TestEmailCampaignForm`, allowing users to choose contacts directly from the `TestContactList`
-   ada83cf: Add filter for `sendingState` in `EmailCampaignsGrid`

## 2.1.6

### Patch Changes

-   be6d19b: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.1.5

## 2.1.4

## 2.1.3

## 2.1.2

### Patch Changes

-   f675cd0: CSV Import Validation Improvements and Bug Fix

    Add better validation for csv imports.

    Add better feedback after a csv import when something goes wrong. User can download a file with failing rows.

    Fix a bug when importing via csv in a targetgroup. The contact was only added to the manually assigned contacts and not to the actual target group.

## 2.1.1

## 2.1.0

## 2.0.2

## 2.0.1

## 2.0.0

### Major Changes

-   e5dbbfa: Add `resolvePreviewUrlForScope` in `BrevoConfigProvider` to be able to provide internationalization for the preview. The previous `previewUrl` option has been removed and must be defined via the `resolvePreviewUrlForScope`.

    **The project can then call different urls based on the scope like that:**

    ```typescript
        resolvePreviewUrlForScope: (scope: ContentScope) => {
            return `${config.campaignUrl}/preview/${scope.domain}/${scope.language}`;
        },
    ```

-   166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:

    -   Now requires >= v6.0.0 for `@comet` packages

-   aae0de4: Add `BrevoConfigProvider`

    You must add the new `BrevoConfigProvider` in you `App.tsx`. The config requires passing the `apiUrl`:

    ```tsx
    <BrevoConfigProvider value={{ apiUrl: config.apiUrl }}>{/* ... */}</BrevoConfigProvider>
    ```

    The `apiUrl` is used by the CSV contact import to upload files to the API.

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

### Minor Changes

-   e774ecb: Allow manually assigning contacts to a target group

    This is in addition to the existing automatic assignment via filters.

-   34beaac: All assigned contacts are now displayed in a datagrid on the target group edit admin page.
-   274cc77: Add a download button in the target group grid to download a list of contacts as csv file.

    It is possible to configure additional contact attributes for the export in the `createTargetGroupsPage`.

    ```diff
    createTargetGroupsPage({
        // ....
    +   exportTargetGroupOptions: {
    +       additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
    +       exportFields: brevoContactConfig.exportFields,
    +   },
    });
    ```

-   a7b82e7: Add `scope` in `previewState` for the `EmailCampaignView`

    This can be useful for example when applications have different styling depending on the scope.

-   be70f36: Fix `TargetGroupForms` if no additional form fields are defined.
-   aae0de4: Add functionality to import Brevo contacts from CSV files

    You can import CSV files via the Admin interface or via CLI command.

    **Note:** For the import to work, you must provide a `redirectUrlForImport` to the `BrevoModule` in the API and an `apiUrl` to the `BrevoConfigProvider` in the admin. See the respective changelog entries for more information.

    CLI command:

    ```bash
    npm run --prefix api console import-brevo-contacts -- -p <path-to-csv-file> -s '<scope-json>' [--targetGroupIds <ids...>]

    // Example:
    npm run --prefix api console import-brevo-contacts -- -p test_contacts_import.csv -s '{"domain": "main", "language":"de"}' --targetGroupIds 2618c982-fdf8-4cab-9811-a21d3272c62c,c5197539-2529-48a7-9bd1-764e9620cbd2
    ```

-   f7c0fdd: Allow sending a campaign to multiple target groups
-   539b321: Allow react-intl v5 and v6 as peerDependency
-   42746b1: Add an edit page for brevo contacts
    It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

    ```diff
        createBrevoContactsPage({
             //...
    +        additionalFormFields: brevoContactConfig.additionalFormFields,
    +        input2State: brevoContactConfig.input2State,
        });
    ```

### Patch Changes

-   5b763f3: Fix scheduledAt date validation error shown when scheduleAt date is in the past when email campaign is already sending or in sent state
    Now routing back to the email campaign grid after sending email campaign now
