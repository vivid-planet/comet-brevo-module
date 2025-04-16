---
"@comet/brevo-api": minor
---

Add `BlacklistedContacts` table to store hashed blacklisted contacts to prevent importing blacklisted contacts

If adding contacts without sending a double opt-in email is enabled, use `createBlacklistedContactsEntity` for creating a `BlacklistedContacts` entity. Pass `Scope` and add it to the `AppModule`:

```diff
          BrevoModule.register({
            brevo: {
                  //...
+               BlacklistedContacts
               }
            //...
          });
```

Add `emailHashKey` to your environment variables:

```diff
+  @IsString()
+  @Length(64)
+  EMAIL_HASH_KEY: string;
```

Also add it to the `config.ts` and your `AppModule`:

```diff
    //...
    ecgRtrList: {
        apiKey: envVars.ECG_RTR_LIST_API_KEY,
    },
    contactsWithoutDoi: {
      allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
+     emailHashKey: config.contactsWithoutDoi.emailHashKey,
    },
    sitePreviewSecret: envVars.SITE_PREVIEW_SECRET,
```

```diff
         BrevoModule.register({
           brevo: {
                 //...
               BlacklistedContacts
              }
            contactsWithoutDoi: {
              allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
+             emailHashKey: config.contactsWithoutDoi.emailHashKey,
                    },
           //...
         });
```
