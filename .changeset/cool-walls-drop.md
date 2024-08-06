---
"@comet/brevo-api": minor
---

Export `BrevoContactsService` so that it can be used in the application

This allows, for example, adding a custom REST request in the application to subscribe to the newsletter. The application should then add reCAPTCHA before calling the BrevoContactsService to prevent problems with bots.
