---
"@comet/brevo-admin": minor
"@comet/brevo-api": minor
---

Added logging for contacts created without sending a double opt-in confirmation

When a user adds a contact and skips sending the double opt-in email, the action is logged.

If adding contacts without sending a double opt-in email is allowed, use `createBrevoEmailImportLogEntity` for creating `brevo-email-import-log` entity. Pass `Scope` and add it to the `AppModule`:

```diff
          BrevoModule.register({
            brevo: {
                  //...
+           BrevoEmailImportLog
                   }
                //...
              });
```
