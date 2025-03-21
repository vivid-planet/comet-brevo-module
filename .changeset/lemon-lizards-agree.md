---
"@comet/brevo-admin": minor
"@comet/brevo-api": minor
---

Add logging for contacts imported without double opt-in confirmation

When a user adds a contact using the CSV-file import skips sending the double opt-in email, the action is logged.
