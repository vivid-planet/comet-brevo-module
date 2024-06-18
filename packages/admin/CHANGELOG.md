# @comet/brevo-admin

## 2.0.0

### Major Changes

-   166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:

    -   Now requires >= v6.0.0 for `@comet` packages

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
