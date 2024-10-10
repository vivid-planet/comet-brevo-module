---
"@comet/brevo-admin": patch
"@comet/brevo-api": patch
---

CSV Import Validation Improvements and Bug Fix

Add better validation for csv imports.

Add better feedback after a csv import when something goes wrong. User can download a file with failing rows.

Fix a bug when importing via csv in a targetgroup. The contact was only added to the manually assigned contacts and not to the actual target group.
