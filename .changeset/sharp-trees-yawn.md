---
"@comet/brevo-api": minor
"@comet/brevo-admin": minor
---

Add functionality to import Brevo contacts from CSV files

You can import CSV files via the Admin interface or via CLI command.

**Note:** For the import to work, you must provide a `redirectUrlForImport` to the `BrevoModule` in the API and an `apiUrl` to the `BrevoConfigProvider` in the admin. See the respective changelog entries for more information.

CLI command:

```bash
npm run --prefix api console import-brevo-contacts -- -p <path-to-csv-file> -s '<scope-json>' [--targetGroupIds <ids...>]

// Example:
npm run --prefix api console import-brevo-contacts -- -p test_contacts_import.csv -s '{"domain": "main", "language":"de"}' --targetGroupIds 2618c982-fdf8-4cab-9811-a21d3272c62c,c5197539-2529-48a7-9bd1-764e9620cbd2
```
