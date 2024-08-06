---
"@comet/brevo-api": major
---

The `allowedRedirectUrl` must now be configured within the resolveConfig for each specific scope, instead of being set once for all scopes in the brevo config.

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
