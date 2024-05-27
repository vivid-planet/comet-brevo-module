---
"@comet/brevo-api": major
---

Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

**Breaking Changes**:

- Now requires >= v6.0.0 for `@comet` packages
- All GraphQL resolvers now require the `brevo-newsletter` permission.
- `BrevoContactResolver#subscribeBrevoContact` mutation: The `scope` argument was moved outside `input` to enable an automatic scope check
- `BrevoContactsService#createDoubleOptInContact`: `scope` was moved outside `data` and is now the second argument
- `TargetGroupsService#findNonMainTargetGroups`: `data` was replaced with `scope`
