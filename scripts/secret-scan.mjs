#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { collectFiles, relativeFrom } from "./lib/extension-utils.mjs";

const SECRET_PATTERNS = [
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/ },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{30,}/ },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "Stripe live key", pattern: /sk_live_[A-Za-z0-9]{20,}/ },
  { name: "Slack token", pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  {
    name: "hardcoded secret assignment",
    pattern: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'](?!--)[A-Za-z0-9_./+=-]{24,}["']/i,
  },
];

const SKIP_PATH_PARTS = [
  "/node_modules/",
  "/coverage/",
  "/.turbo/",
  "/dist/",
  "/.git/",
  "/fixtures/",
];

export async function scanSecrets(root = process.cwd()) {
  const files = await collectFiles(root, {
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".json",
      ".md",
      ".yml",
      ".yaml",
      ".env",
    ],
    skipGenerated: false,
  });
  const findings = [];

  for (const file of files) {
    const normalized = `/${relativeFrom(root, file)}`;
    if (SKIP_PATH_PARTS.some((part) => normalized.includes(part))) continue;
    if (/\/_template\//.test(normalized)) continue;
    if (/^\/catalog\.json$/.test(normalized)) continue;
    if (/\/\.env/.test(normalized) || normalized.endsWith("/.env")) {
      findings.push({
        file: relativeFrom(root, file),
        name: "env file",
        detail: "Do not commit .env files",
      });
      continue;
    }
    const content = await readFile(file, "utf8");
    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        findings.push({
          file: relativeFrom(root, file),
          name,
          detail: "Potential secret detected",
        });
      }
    }
  }

  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rootArgIndex = process.argv.indexOf("--root");
  const root = rootArgIndex >= 0 ? process.argv[rootArgIndex + 1] : process.cwd();
  const findings = await scanSecrets(root);
  if (findings.length === 0) {
    console.log("No obvious secrets found.");
  } else {
    console.error("Secret scan failed:");
    for (const finding of findings) {
      console.error(`- ${finding.file}: ${finding.name} (${finding.detail})`);
    }
    process.exit(1);
  }
}
