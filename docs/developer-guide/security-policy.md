# Security Policy

Extensions often handle credentials and external service data. Treat every extension as security-sensitive.

## Required behavior

- Never commit secrets, `.env*` files, private keys, local databases, or API tokens.
- Never log credentials or return them from MCP tools.
- Resolve credentials through Radarboard SDK context APIs.
- Keep OAuth scopes and API permissions minimal.
- Return stable empty states when credentials are missing.
- Document required scopes, webhooks, and rate limits in the README.

## Review focus

Maintainers may request changes for:

- hardcoded secrets or test tokens
- overly broad permissions
- unclear data retention behavior
- mutation-capable MCP tools without explicit user value
- dependency choices that expand the attack surface without need

## Reporting issues

Report security issues privately to the Radarboard maintainers instead of opening a public issue.
