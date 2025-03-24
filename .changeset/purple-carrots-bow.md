---
"@comet/brevo-api": major
---

Add `BlacklistedContacts` table to store encrypted blacklisted contacts

Use `createBlacklistedContactsEntity` for creating `BlacklistedContacts` entity. Pass `Scope` and add it to the `AppModule`:

`diff
          BrevoModule.register({
            brevo: {
                  //...
      +       BlacklistedContacts
               }
            //...
          });
    `

Add `encryptionKey` to your environment variables:

```diff
+  @IsString()
+ @Length(64)
+ ENCRYPTION_KEY: string;
```

Also add it to the `config.ts` and your `AppModule`:

```diff
    //...
    ecgRtrList: {
        apiKey: envVars.ECG_RTR_LIST_API_KEY,
    },
    +       encryptionKey: envVars.ENCRYPTION_KEY,
    sitePreviewSecret: envVars.SITE_PREVIEW_SECRET,
```

```diff
         BrevoModule.register({
           brevo: {
                 //...
               BlacklistedContacts
              }
       +   encryptionKey: config.encryption.encryptionKey,
           //...
         });
```
