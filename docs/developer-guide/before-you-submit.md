# Before You Submit

Run:

```bash
pnpm install
pnpm validate
pnpm check:extensions
pnpm test
pnpm catalog:generate
```

Check:

- extension package name matches its folder
- default package export resolves
- descriptor metadata is final
- README includes setup and limitations
- credentials and scopes are documented
- CHANGELOG exists
- tests include conformance coverage
- no secrets or generated artifacts are committed
- screenshots or recordings are included for UI extensions
- capability ownership is clear

Open the PR only when `radarboard-extension submit-check` passes.
