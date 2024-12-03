---
"@comet/brevo-api": major
---

Refactor `email-campaign` and `target-group` entity

Use `createEmailCampaignEntity` for creating `email-campaign` entity. Pass `EmailCampaignContentBlock`, `Scope` and `TargetGroup`.

Use `createTargetGroupEntity` for creating `target-group` entity. Pass `Scope` and optional `BrevoFilterAttributes`
