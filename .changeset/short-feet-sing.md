---
"@comet/brevo-admin": patch
"@comet/brevo-api": patch
---

Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.
