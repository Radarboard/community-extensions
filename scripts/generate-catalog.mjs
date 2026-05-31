#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import config from "../radarboard.community.config.js";
import {
  EXTENSION_TYPES,
  exportTargets,
  extractStringField,
  listAllExtensions,
  readJson,
  relativeFrom,
} from "./lib/extension-utils.mjs";

async function descriptorFields(extension) {
  const pkgPath = join(extension.dir, "package.json");
  if (!existsSync(pkgPath)) return {};
  const pkg = await readJson(pkgPath);
  const entry =
    typeof pkg.exports?.["."] === "string"
      ? pkg.exports["."]
      : exportTargets(pkg.exports?.["."] ?? {})[0];
  if (!entry) return {};
  const entryPath = join(extension.dir, entry);
  if (!existsSync(entryPath)) return {};
  const content = await readFile(entryPath, "utf8");
  return {
    name: extractStringField(content, "name"),
    description: extractStringField(content, "description"),
    category:
      extractStringField(content, "category") ?? extractStringField(content, "catalogCategory"),
    version: extractStringField(content, "version") ?? pkg.version,
  };
}

const extensions = [];
for (const extension of await listAllExtensions(process.cwd())) {
  const pkg = await readJson(join(extension.dir, "package.json"));
  const fields = await descriptorFields(extension);
  extensions.push({
    id: extension.id,
    type: extension.type,
    packageName: pkg.name,
    path: relativeFrom(process.cwd(), extension.dir),
    name: fields.name ?? extension.id,
    description: fields.description ?? "",
    category: fields.category ?? null,
    version: fields.version ?? pkg.version ?? null,
    hasReadme: existsSync(join(extension.dir, "README.md")),
    hasChangelog: existsSync(join(extension.dir, "CHANGELOG.md")),
  });
}

extensions.sort((left, right) =>
  `${left.type}:${left.id}`.localeCompare(`${right.type}:${right.id}`)
);

const catalog = {
  schemaVersion: 1,
  name: config.name,
  repository: config.repository,
  docs: config.docs,
  extensionDirectories: {
    integration: EXTENSION_TYPES.integration.dir,
    plugin: EXTENSION_TYPES.plugin.dir,
    widget: EXTENSION_TYPES.widget.dir,
  },
  extensions,
};

await writeFile("catalog.json", `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Generated catalog.json with ${extensions.length} extension(s).`);
