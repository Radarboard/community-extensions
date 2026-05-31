import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  detectExtensionEntries,
  makeDevManifestEntries,
  parseFlags,
  sandboxPathFor,
} from "../dev-session.mjs";

test("parseFlags parses positional and named flags", () => {
  assert.deepEqual(parseFlags(["--radarboard", "../radarboard", "widget", "--no-open"]), {
    _: ["widget"],
    radarboard: "../radarboard",
    "no-open": true,
  });
});

test("detectExtensionEntries reads extension package manifest", async () => {
  const temp = await mkdtemp(join(tmpdir(), "radarboard-ext-tools-"));
  try {
    await mkdir(join(temp, "widgets/demo"), { recursive: true });
    await writeFile(
      join(temp, "radarboard-extension.json"),
      JSON.stringify({
        extensions: [{ type: "widget", path: "widgets/demo", name: "@radarboard/widget-demo" }],
      })
    );
    const entries = await detectExtensionEntries(temp);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].type, "widget");
    assert.ok(entries[0].path.endsWith("widgets/demo"));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("makeDevManifestEntries stores paths relative to Radarboard root", () => {
  assert.deepEqual(
    makeDevManifestEntries(
      [{ type: "widget", path: "/tmp/community/widgets/demo" }],
      "/tmp/radarboard"
    ),
    [{ type: "widget", path: "../community/widgets/demo" }]
  );
});

test("sandboxPathFor returns type-specific sandbox routes", () => {
  assert.equal(sandboxPathFor("widget"), "/debug/widget-sandbox");
  assert.equal(sandboxPathFor("plugin"), "/debug/plugin-sandbox");
  assert.equal(sandboxPathFor("integration"), "/debug/integration-sandbox");
});
