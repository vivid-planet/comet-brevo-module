---
"@comet/brevo-api": patch
---

Fix CSV import by correcting types

Previously, the type string[][] was used for the failedColumns field in the CSV import. While this worked in earlier versions, it caused an error after recent package updates. This issue has been resolved by changing the type to JSONObject, ensuring compatibility with the updated dependencies.
