# VS Code Extension

The Radarboard VS Code extension is the editor layer for community development. It should shell out to `radarboard-extension` instead of reimplementing platform logic.

## Commands

- `Radarboard: Create Extension`
- `Radarboard: Connect to Radarboard Dev App`
- `Radarboard: Start Dev Session`
- `Radarboard: Validate Current Extension`
- `Radarboard: Run Submission Check`
- `Radarboard: Open Sandbox`
- `Radarboard: Open Developer Docs`

## Views

The extension should show:

- detected extension package and type
- Radarboard dev app connection state
- last validation result
- quick links to sandbox, docs, README, and changelog

## Diagnostics

Validation output should be converted into VS Code Problems so contributors can fix package names, missing docs, forbidden imports, and conformance gaps in place.
