---
"@comet/brevo-api": major
---

Remove deprecated `sendinblue` package and replace it with `brevo` (https://github.com/getbrevo/brevo-node)

`Brevo` must now be imported from `@getbrevo/brevo`:

```diff
  + import * as Brevo from "@getbrevo/brevo";
```

`SibApiV3Sdk` is not needed anymore. The import must be removed:

```diff
  - import * as SibApiV3Sdk from "@sendinblue/client";
```
