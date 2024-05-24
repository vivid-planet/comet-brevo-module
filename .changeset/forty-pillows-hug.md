---
"@comet/brevo-admin": minor
---

Add a download button in the target group grid to download a list of contacts as csv file.

It is possible to configure additional contact attributes for the export in the `createTargetGroupsPage.

```diff
createTargetGroupsPage({
    // ....
+   exportTargetGroupOptions: {
+       additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
+       exportFields: brevoContactConfig.exportFields,
+   },
});
```
