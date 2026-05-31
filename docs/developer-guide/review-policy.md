# Review Policy

Radarboard community extensions follow a Raycast-style review model: automated checks first, then human review for usefulness, safety, maintainability, and product fit.

## Maintainer review

Maintainers review:

- focused scope and clear user value
- SDK compatibility
- descriptor and catalog metadata quality
- README, credentials, setup, limitations, and screenshots
- test coverage and conformance checks
- security-sensitive behavior
- dependency and bundle impact
- duplicate extension and canonical capability risk

## Duplicate extensions

Prefer improving an existing extension over creating a duplicate. For shared widget surfaces, a new provider should usually extend the canonical widget instead of creating another canonical widget for the same capability.

## Stale pull requests

PRs can be marked stale when requested changes are unanswered for a long period. Stale does not mean rejected; it means maintainers need confirmation that the contributor still wants to finish the extension.

## Promotion to core

Community extensions can be promoted to the core Radarboard monorepo when they are stable, broadly useful, actively maintained, and aligned with core product direction.
