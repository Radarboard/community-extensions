import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runQualityCheck } from "../check-extensions.mjs";
import { copyTemplate, tokensForName } from "../lib/extension-utils.mjs";
import { scanSecrets } from "../secret-scan.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;

function countErrors(reports) {
  return reports.flatMap((report) => report.checks).filter((check) => check.status === "error")
    .length;
}

test("valid fixture extensions pass quality checks", async () => {
  const reports = await runQualityCheck({ root: join(ROOT, "fixtures/valid-community") });
  assert.equal(reports.length, 3);
  assert.equal(countErrors(reports), 0);
});

test("bad package fixture fails naming and dependency checks", async () => {
  const reports = await runQualityCheck({ root: join(ROOT, "fixtures/invalid-bad-package") });
  const messages = reports.flatMap((report) =>
    report.checks.map((check) => `${check.name}:${check.message ?? ""}`)
  );
  assert.ok(messages.some((message) => message.includes("package name convention")));
  assert.ok(messages.some((message) => message.includes("Forbidden dependency")));
  assert.ok(countErrors(reports) > 0);
});

test("duplicate canonical fixture fails capability governance", async () => {
  const reports = await runQualityCheck({
    root: join(ROOT, "fixtures/invalid-duplicate-canonical"),
  });
  const messages = reports.flatMap((report) => report.checks.map((check) => check.message ?? ""));
  assert.ok(messages.some((message) => message.includes("Duplicate canonical widget")));
});

test("template copy replaces tokens in content and filenames", async () => {
  const temp = await mkdtemp(join(tmpdir(), "radarboard-template-"));
  try {
    const target = join(temp, "widgets", "sample-widget");
    await copyTemplate(join(ROOT, "widgets/_template"), target, tokensForName("sample-widget"));
    assert.ok(existsSync(join(target, "src/hooks/use-sample-widget.ts")));
    const pkg = await readFile(join(target, "package.json"), "utf8");
    assert.match(pkg, /@radarboard\/widget-sample-widget/);
    assert.doesNotMatch(pkg, /__EXT_/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("secret scanner detects committed env files and token-like values", async () => {
  const findings = await scanSecrets(join(ROOT, "fixtures/secret-fixture"));
  assert.ok(findings.length >= 2);
  assert.ok(findings.some((finding) => finding.name === "env file"));
  assert.ok(findings.some((finding) => finding.name === "GitHub token"));
});
