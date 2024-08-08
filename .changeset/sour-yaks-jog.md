---
"@comet/brevo-api": minor
---

Add and export `BrevoTransactionalMailsService` that can be used in the application for sending transactional mails.

**Example Usage of `BrevoTransactionalMailsService`**

```typescript
constructor(private readonly brevoTransactionalMailsService: BrevoTransactionalMailsService) {}

async send(email: string, htmlContent: string, subject: string): Promise<void> {
    await this.brevoTransactionalMailsService.send({ to: [{ email }], htmlContent, subject }, data.scope);
}
```
