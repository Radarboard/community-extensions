import { access, readFile } from "node:fs/promises";

for (const path of ["integrations", "plugins", "widgets"]) {
  await access(path);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.packageManager !== "pnpm@10.32.0") {
  throw new Error("package.json must declare packageManager: pnpm@10.32.0");
}

await import("../radarboard.community.config.js");

console.log("Community extension structure is valid.");
