import { readdir, writeFile } from "node:fs/promises";
import config from "../radarboard.community.config.js";

async function listExtensionDirs(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      path: `${path}/${entry.name}`
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

const catalog = {
  name: config.name,
  repository: config.repository,
  docs: config.docs,
  generatedAt: new Date().toISOString(),
  integrations: await listExtensionDirs(config.integrations),
  plugins: await listExtensionDirs(config.plugins),
  widgets: await listExtensionDirs(config.widgets)
};

await writeFile("catalog.json", `${JSON.stringify(catalog, null, 2)}\n`);
console.log("Generated catalog.json.");
