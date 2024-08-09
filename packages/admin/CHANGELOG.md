# @comet/brevo-admin

## 2.0.0

### Major Changes

-   166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:

    -   Now requires >= v6.0.0 for `@comet` packages

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
