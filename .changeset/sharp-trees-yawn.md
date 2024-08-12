---
"@comet/brevo-api": major
"@comet/brevo-admin": minor
---

Added functionality to import Brevo contacts from CSV files.

**Important Notice:**

- A major bump in `@comet/brevo-api` is required because a new `.env` variable named `REDIRECT_URL_FOR_IMPORT` is needed.

**Usage:**

To import Brevo contacts from a CSV file, use the following console command:

```bash
npm run --prefix api console import-brevo-contacts --path <path-to-csv-file> --scope <scope-json> [--targetGroupIds <ids...>]

