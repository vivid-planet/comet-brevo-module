---
"@comet/brevo-api": patch
---

Fix searching contacts

Previously, Brevo returned a 400 error when an email address was not found. The implementation has been updated to correctly handle the 404 status code instead of 400. As a result, the contact search functionality now works as expected without throwing an error when no matching email address is found.
