---
"@comet/brevo-admin": major
"@comet/brevo-api": major
---

Removes the brevo config page, `createBrevoConfigPage` is no longer available.

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
