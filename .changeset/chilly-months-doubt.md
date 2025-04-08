---
"@comet/brevo-admin": minor
"@comet/brevo-api": minor
---

Add optional feature for importing contacts without sending a double opt-in email

Enable creating contacts manually or using the import in admin without sending a double opt-in mail by setting a new environment variable:

```diff
+   @IsBoolean()
+   @IsUndefinable()
+   @Transform(({ value }) => value === "true")
+   ALLOW_ADDING_CONTACTS_WITHOUT_DOI?: boolean;
```

Add `contactsWithoutDoi` to your`AppModule`:

```diff
         BrevoModule.register({
           brevo: {
                 //...
               BlacklistedContacts
              }
+           contactsWithoutDoi: {
+               allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
+               emailHashKey: config.contactsWithoutDoi.emailHashKey,
                    },
           //...
         });
```

Add `allowAddingContactsWithoutDoi` to the `config.ts` in the api:

```diff
    //...
    ecgRtrList: {
            apiKey: envVars.ECG_RTR_LIST_API_KEY,
        },
+    contactsWithoutDoi: {
+       allowAddingContactsWithoutDoi: envVars.ALLOW_ADDING_CONTACTS_WITHOUT_DOI,
        },
    //...
```

Add it to the `config.ts` in the admin:

```diff
        //...
            return {
                    ...cometConfig,
            apiUrl: environmentVariables.API_URL,
            adminUrl: environmentVariables.ADMIN_URL,
            sitesConfig: JSON.parse(environmentVariables.SITES_CONFIG) as SitesConfig,
            buildDate: environmentVariables.BUILD_DATE,
            buildNumber: environmentVariables.BUILD_NUMBER,
            commitSha: environmentVariables.COMMIT_SHA,
            campaignUrl: environmentVariables.CAMPAIGN_URL,
+           allowAddingContactsWithoutDoi: environmentVariables.ALLOW_ADDING_CONTACTS_WITHOUT_DOI === "true",
                  }
```

Add `allowAddingContactsWithoutDoi` to the `BrevoConfigProvider` in your `App.tsx`:

```diff
    //...
           <BrevoConfigProvider
                 value={{
                        scopeParts: ["domain", "language"],
                        apiUrl: config.apiUrl,
                        resolvePreviewUrlForScope: (scope: ContentScope) => {
                            return `${config.campaignUrl}/block-preview/${scope.domain}/${scope.language}`;
                            },
+                       allowAddingContactsWithoutDoi: config.allowAddingContactsWithoutDoi,
                            }}
            >
```
