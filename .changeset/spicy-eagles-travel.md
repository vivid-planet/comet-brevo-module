---
"@comet/brevo-admin": patch
"@comet/brevo-api": patch
---

Improve error handling for adding contacts:

-   Display specific error messages when attempting to create a contact that already exists or is blacklisted.
-   Provide error logs when importing blacklisted contacts via CSV import.
