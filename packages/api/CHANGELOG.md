# @comet/brevo-api

## 2.0.0

### Major Changes

-   166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:

    -   Now requires >= v6.0.0 for `@comet` packages
    -   All GraphQL resolvers now require the `brevo-newsletter` permission.
    -   `BrevoContactResolver#subscribeBrevoContact` mutation: The `scope` argument was moved outside `input` to enable an automatic scope check
    -   `BrevoContactsService#createDoubleOptInContact`: `scope` was moved outside `data` and is now the second argument
    -   `TargetGroupsService#findNonMainTargetGroups`: `data` was replaced with `scope`

### Minor Changes

-   6cf6252: Add scope to the preview state so it can be accessed in the preview page if necessary
-   42746b1: Add an edit page for brevo contacts
    It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

    ```diff
        createBrevoContactsPage({
             //...
    +        additionalFormFields: brevoContactConfig.additionalFormFields,
    +        input2State: brevoContactConfig.input2State,
        });
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

### Patch Changes

-   42746b1: Fix bug that does not add the contact to all target groups when subscribing
