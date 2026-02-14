---
"@comet/brevo-api": patch
---

Fix email campaigns getting stuck in broken state when scheduled in the past

- Create custom `@IsFutureDate()` validator to evaluate validation at runtime instead of class definition time
- Check actual campaign status from Brevo before blocking updates to past-scheduled campaigns
- Only block updates if campaign has actually been sent (not just scheduled in the past)
- Automatically sync local campaign state with Brevo's actual state
