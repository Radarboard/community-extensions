import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

for (const path of ["integrations", "plugins", "widgets"]) {
  await access(path);
}

for (const path of [
  "integrations/_template",
  "plugins/_template",
  "widgets/_template",
  "skills/create-integration/SKILL.md",
  "skills/create-plugin/SKILL.md",
  "skills/create-widget/SKILL.md",
]) {
  if (!existsSync(path)) {
    throw new Error(`Missing required community asset: ${path}`);
  }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.packageManager !== "pnpm@10.32.0") {
  throw new Error("package.json must declare packageManager: pnpm@10.32.0");
}

await import("../radarboard.community.config.js");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: process.cwd(), stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

run("node", [join("scripts", "check-extensions.mjs")]);
run("node", [join("scripts", "secret-scan.mjs")]);

console.log("Community extension structure is valid.");
