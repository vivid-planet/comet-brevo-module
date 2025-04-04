@comet/brevo-admin": major
"@comet/brevo-api": major

---

Added logging for contacts created manually via the admin contact form without double opt-in confirmation

When a user adds a contact manually and skips sending the double opt-in email, the action is logged.

Use `createBrevoEmailImportLogEntity` for creating `brevo-email-import-log` entity. Pass `Scope` and add it to the `AppModule`:

    ```diff
          BrevoModule.register({
            brevo: {
                  //...
      +       BrevoEmailImportLog
               }
            //...
          });
    ```
