---
"@comet/brevo-api": major
---

Add `redirectUrlForImport` to `BrevoModule` config

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
