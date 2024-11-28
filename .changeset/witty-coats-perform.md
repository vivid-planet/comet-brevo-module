---
"@comet/brevo-admin": major
---

Define `scopeParts` in `BrevoConfig`

Previously the `scopeParts` were passed to the functions:

-   createBrevoContactsPage
-   createTargetGroupsPage
-   createEmailCampaignsPage
-   createBrevoConfigPage

Now they are defined once in the `BrevoConfig`:

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
