import { access } from "node:fs/promises";

for (const path of ["integrations", "plugins", "widgets"]) {
  await access(path);
}

console.log("Community extension structure is valid.");
