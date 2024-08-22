---
"@comet/brevo-admin": major
---

Add `resolvePreviewUrlForScope` in `BrevoConfigProvider` to be able to provide internationalization for the preview

**The project can then call different urls based on the scope like that:**

```typescript
    resolvePreviewUrlForScope: (scope: ContentScope) => {
        return `${config.campaignUrl}/preview/${scope.domain}/${scope.language}`;
    },
```
