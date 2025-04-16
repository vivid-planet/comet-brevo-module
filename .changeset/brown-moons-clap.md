---
"@comet/brevo-admin": patch
"@comet/brevo-api": patch
---

Fix scope parameter handling in `doubleOptInTemplates` query

Previously, the `scope` parameter in the `doubleOptInTemplates` query was not properly handled, causing it to always resolve to `undefined`. This update:

-   Adds proper scope parameter handling in the API
-   Implements scope parameter passing from the admin interface
-   Ensures correct template filtering based on scope
