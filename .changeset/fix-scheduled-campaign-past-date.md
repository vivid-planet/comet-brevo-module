---
"@comet/brevo-api": patch
---

Fix race condition in email campaign updates for past-scheduled campaigns

- Use `@MinDate(() => new Date())` to evaluate date at validation time instead of server startup
- Check actual Brevo campaign status before blocking updates to past-scheduled campaigns
- Sync local state with Brevo's actual state when campaign is scheduled in the past
