---
"@comet/brevo-admin": minor
"@comet/brevo-api": minor
---

Add an edit page for brevo contacts
It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

```diff
    createBrevoContactsPage({
         //...
+        additionalFormFields: brevoContactConfig.additionalFormFields,
+        input2State: brevoContactConfig.input2State,
    });
```
