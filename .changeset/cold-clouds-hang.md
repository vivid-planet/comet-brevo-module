---
"@comet/brevo-api": minor
---

Add `DeleteUnsubscribedContactsConsole` job to enable the deletion of blocklisted contacts. This job can be utilized as a cronjob to periodically clean up the blocklisted contacts.

Add additional functions `findContacts` and `deleteContacts` in `brevo-api-contact-service-ts` to enable finding and deleting all contacts.
