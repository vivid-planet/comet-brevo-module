---
"@comet/brevo-api": minor
---

Brevo returns a 404 error when an email address is not found and a 400 error if an invalid email is provided. Instead of handling only one of these errors, both status codes must be ignored to prevent the contact search from throwing an error.
