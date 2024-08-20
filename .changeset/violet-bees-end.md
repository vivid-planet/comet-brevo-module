---
"@comet/brevo-admin": major
---

Add `BrevoConfigProvider`

You must add the new `BrevoConfigProvider` in you `App.tsx`. The config requires passing the `apiUrl`:

```tsx
<BrevoConfigProvider value={{ apiUrl: config.apiUrl }}>{/* ... */}</BrevoConfigProvider>
```

The `apiUrl` is used by the CSV contact import to upload files to the API.
