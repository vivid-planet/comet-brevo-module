---
"@comet/brevo-admin": major
"@comet/brevo-api": minor
---

A required brevo config page must now be generated with `createBrevoConfigPage`.
All necessary brevo configuration (for each scope) must be configured within this page for emails campaigns to be sent.

```diff
+ const BrevoConfigPage = createBrevoConfigPage({
+        scopeParts: ["domain", "language"],
+ });
```

Env vars containing the brevo sender information can be removed.

```diff
- BREVO_SENDER_NAME=senderName
- BREVO_SENDER_EMAIL=senderEmail
```
