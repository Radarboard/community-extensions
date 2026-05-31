#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { copyTemplate, EXTENSION_TYPES, ensureDir, tokensForName } from "./lib/extension-utils.mjs";

const [type, rawName] = process.argv.slice(2);

if (!EXTENSION_TYPES[type] || !rawName) {
  console.error(
    "Usage: pnpm create-integration <name> | pnpm create-plugin <name> | pnpm create-widget <name>"
  );
  process.exit(1);
}

const tokens = tokensForName(rawName);
const root = process.cwd();
const templateDir = join(root, EXTENSION_TYPES[type].dir, "_template");
const targetDir = join(root, EXTENSION_TYPES[type].dir, tokens.__EXT_KEBAB__);

if (!existsSync(templateDir)) {
  console.error(`Template not found: ${templateDir}`);
  process.exit(1);
}

if (existsSync(targetDir)) {
  console.error(`${type} already exists: ${targetDir}`);
  process.exit(1);
}

await ensureDir(join(root, EXTENSION_TYPES[type].dir));
await copyTemplate(templateDir, targetDir, tokens);

console.log(`Created ${type}: ${targetDir}`);
console.log("");
console.log("Next steps:");
console.log(
  `  1. Replace placeholder metadata in ${EXTENSION_TYPES[type].dir}/${tokens.__EXT_KEBAB__}`
);
console.log("  2. Add real implementation and tests");
console.log("  3. Run pnpm check:extensions");
console.log("  4. Run pnpm validate");
