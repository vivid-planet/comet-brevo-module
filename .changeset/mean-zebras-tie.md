---
"@comet/brevo-admin": patch
---

Deprecate `scopeParts` in `createBrevoTestContactsPage` and use scopeParts from the BrevoConfig instead

Instead, the `scopeParts` from the BrevoConfig will be used. This is in line with the other Page factories.
