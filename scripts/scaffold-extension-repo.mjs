#!/usr/bin/env node
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  copyTemplate,
  EXTENSION_TYPES,
  ensureDir,
  expectedPackageName,
  toDisplayName,
  toKebab,
  tokensForName,
} from "./lib/extension-utils.mjs";

function parseArgs(argv) {
  const name = argv.find((arg) => !arg.startsWith("--"));
  const types = ["integration", "plugin", "widget"].filter((type) => argv.includes(`--${type}`));
  const outIndex = argv.indexOf("--out");
  const out = outIndex >= 0 ? argv[outIndex + 1] : ".";
  return { name, types, out };
}

const args = parseArgs(process.argv.slice(2));

if (!args.name || args.types.length === 0) {
  console.error(
    "Usage: pnpm scaffold:extension-repo <name> [--integration] [--plugin] [--widget] [--out <dir>]"
  );
  process.exit(1);
}

const root = process.cwd();
const kebab = toKebab(args.name);
const displayName = toDisplayName(kebab);
const repoDir = join(resolve(args.out), `radarboard-${kebab}`);
const tokens = tokensForName(kebab);

if (existsSync(repoDir)) {
  console.error(`Target already exists: ${repoDir}`);
  process.exit(1);
}

await ensureDir(repoDir);

const manifestExtensions = args.types.map((type) => ({
  type,
  path: `${EXTENSION_TYPES[type].dir}/${kebab}`,
  name: expectedPackageName(type, kebab),
  required: true,
}));

await writeFile(
  join(repoDir, "radarboard-extension.json"),
  `${JSON.stringify(
    {
      name: `${displayName} Extension Package`,
      description: `${displayName} extension package for Radarboard.`,
      author: { name: "Your Name", url: "https://github.com/yourname" },
      minAppVersion: "1.0.0",
      extensions: manifestExtensions,
    },
    null,
    2
  )}\n`
);

await writeFile(
  join(repoDir, "package.json"),
  `${JSON.stringify(
    {
      name: `radarboard-${kebab}`,
      version: "0.1.0",
      private: true,
      type: "module",
      packageManager: "pnpm@10.32.0",
      scripts: {
        test: "node --test",
        typecheck: "tsc --noEmit",
      },
      devDependencies: {
        typescript: "^5.9.3",
      },
    },
    null,
    2
  )}\n`
);

await writeFile(
  join(repoDir, "pnpm-workspace.yaml"),
  `packages:\n${args.types.map((type) => `  - "${EXTENSION_TYPES[type].dir}/*"`).join("\n")}\n`
);
await writeFile(
  join(repoDir, "tsconfig.extension.json"),
  `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "jsx": "react-jsx",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "noEmit": true\n  }\n}\n`
);
await writeFile(
  join(repoDir, ".gitignore"),
  "node_modules/\ndist/\ncoverage/\n.turbo/\n*.tsbuildinfo\n.env*\n"
);
await writeFile(
  join(repoDir, "README.md"),
  `# ${displayName} Extension Package\n\nCommunity Radarboard extension package containing: ${args.types.join(", ")}.\n\n## Development\n\n\`\`\`bash\npnpm install\npnpm test\npnpm typecheck\n\`\`\`\n\n## Installation\n\nInstall this package from its GitHub URL in Radarboard.\n`
);

for (const type of args.types) {
  const templateDir = join(root, EXTENSION_TYPES[type].dir, "_template");
  const targetDir = join(repoDir, EXTENSION_TYPES[type].dir, kebab);
  await ensureDir(join(repoDir, EXTENSION_TYPES[type].dir));
  await copyTemplate(templateDir, targetDir, tokens);
}

console.log(`Scaffolded extension package: ${repoDir}`);
