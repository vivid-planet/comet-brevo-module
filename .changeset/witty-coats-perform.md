---
"@comet/brevo-admin": major
---

Define scopeParts in BrevoConfig

Previously the scopeParts had to be defined in the functions:

-   createBrevoContactsPage
-   createTargetGroupsPage
-   createEmailCampaignsPage

Now it has to be defined once in the BrevoConfig:

```tsx
<BrevoConfigProvider
    value={{
        scopeParts: ["domain", "language"],
        ...otherProps,
    }}
>
    {children}
</BrevoConfigProvider>
```
