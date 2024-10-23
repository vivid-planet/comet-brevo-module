---
"@comet/brevo-api": major
"@comet/brevo-admin": minor
---

Add a brevo configuration field for `redirectionUrl`
Env vars containing this information can be removed and must be removed from the brevo module configuration.

```diff
BrevoModule.register({
    brevo: {
-       allowedRedirectionUrl: config.brevo.allowedRedirectionUrl,
        //...
    },
    //..
})
```
