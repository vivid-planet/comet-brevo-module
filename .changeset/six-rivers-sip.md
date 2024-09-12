---
"@comet/brevo-api": patch
---

Fix Campaign Statistics.

Addressed an issue where the globalStats property was being used to retrieve campaign stats, but it wasn’t working as expected. We now use the campaignStats property instead, which returns a list. The first value from this list is now used to show accurate campaign statistics.
