import { writeFile } from "node:fs/promises";

const catalog = {
  generatedAt: new Date().toISOString(),
  integrations: [],
  plugins: [],
  widgets: []
};

await writeFile("catalog.json", `${JSON.stringify(catalog, null, 2)}\n`);
