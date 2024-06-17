---
"@comet/brevo-admin": minor
"@comet/brevo-api": minor
---

Add brevo configuration fields for api key and double opt-in email template.
Env vars containing this information can be removed and must be removed from the brevo module configuration.

```diff
- BREVO_API_KEY=apiKey
- BREVO_DOUBLE_OPT_IN_TEMPLATE_ID=templateId
```

```diff
BrevoModule.register({
    brevo: {
-       apiKey: config.brevo.apiKey,
-       doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
        //...
    },
    //..
})
```
