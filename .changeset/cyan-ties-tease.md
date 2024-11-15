---
"@comet/brevo-admin": major
---

Remove factory createEmailCampaignsPage

The `EmailCampaignsPage` can now be created like this:

```tsx
<EmailCampaignsPage EmailCampaignContentBlock={EmailCampaignContentBlock} />
```
