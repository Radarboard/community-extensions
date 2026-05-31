import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export const EXTENSION_TYPES = {
  integration: {
    dir: "integrations",
    packagePrefix: "@radarboard/integration-",
    sdkPackage: "@radarboard/integration-sdk",
    conformanceFunction: "runIntegrationConformance",
    allowedWorkspaceDeps: new Set([
      "@radarboard/integration-sdk",
      "@radarboard/types",
      "@radarboard/utils",
    ]),
    forbiddenImportPrefixes: ["@radarboard/plugin-", "@radarboard/widget-", "@radarboard/feature-"],
  },
  plugin: {
    dir: "plugins",
    packagePrefix: "@radarboard/plugin-",
    sdkPackage: "@radarboard/plugin-sdk",
    conformanceFunction: "runPluginConformance",
    allowedWorkspaceDeps: new Set([
      "@radarboard/plugin-sdk",
      "@radarboard/types",
      "@radarboard/utils",
      "@radarboard/ui",
      "@radarboard/hooks",
      "@radarboard/widget-engine",
      "@radarboard/embedding-service",
      "@radarboard/llm",
    ]),
    forbiddenImportPrefixes: [
      "@radarboard/integration-",
      "@radarboard/widget-",
      "@radarboard/feature-",
    ],
  },
  widget: {
    dir: "widgets",
    packagePrefix: "@radarboard/widget-",
    sdkPackage: "@radarboard/widget-sdk",
    conformanceFunction: "runWidgetConformance",
    allowedWorkspaceDeps: new Set([
      "@radarboard/widget-sdk",
      "@radarboard/widget-engine",
      "@radarboard/types",
      "@radarboard/utils",
      "@radarboard/ui",
      "@radarboard/charts",
      "@radarboard/hooks",
      "@radarboard/assistant-ui",
    ]),
    forbiddenImportPrefixes: [
      "@radarboard/integration-",
      "@radarboard/plugin-",
      "@radarboard/feature-",
    ],
  },
};

export const EXTENSION_TYPE_NAMES = Object.keys(EXTENSION_TYPES);

export const GENERATED_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
]);

export function toKebab(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toCamel(kebab) {
  return kebab.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

export function toPascal(kebab) {
  const camel = toCamel(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toDisplayName(kebab) {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toUpperSnake(kebab) {
  return kebab.toUpperCase().replace(/-/g, "_");
}

export function tokensForName(name) {
  const kebab = toKebab(name);
  return {
    __EXT_KEBAB__: kebab,
    __EXT_CAMEL__: toCamel(kebab),
    __EXT_PASCAL__: toPascal(kebab),
    __EXT_NAME__: toDisplayName(kebab),
    __EXT_UPPER__: toUpperSnake(kebab),
  };
}

export function replaceTokens(content, tokens) {
  return Object.entries(tokens).reduce(
    (result, [token, value]) => result.replaceAll(token, value),
    content
  );
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export function expectedPackageName(type, id) {
  return `${EXTENSION_TYPES[type].packagePrefix}${id}`;
}

export async function listExtensionDirs(root, type) {
  const base = join(root, EXTENSION_TYPES[type].dir);
  if (!existsSync(base)) return [];
  const entries = await readdir(base, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith(".") && name !== "_template")
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({ id, type, dir: join(base, id) }));
}

export async function listAllExtensions(root, filterType) {
  const types = filterType ? [filterType] : EXTENSION_TYPE_NAMES;
  const nested = await Promise.all(types.map((type) => listExtensionDirs(root, type)));
  return nested.flat();
}

export async function collectFiles(dir, options = {}) {
  const {
    includeTests = true,
    extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml"],
    skipGenerated = true,
  } = options;
  const files = [];

  async function walk(current) {
    if (!existsSync(current)) return;
    const currentStat = await stat(current);
    if (!currentStat.isDirectory()) return;

    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      if (skipGenerated && GENERATED_DIR_NAMES.has(entry.name)) continue;
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!includeTests && /\.(test|spec|stories)\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
      if (extensions.some((ext) => entry.name.endsWith(ext))) files.push(fullPath);
    }
  }

  await walk(dir);
  return files.sort((left, right) => left.localeCompare(right));
}

export async function copyTemplate(templateDir, targetDir, tokens) {
  await cp(templateDir, targetDir, {
    recursive: true,
    filter(source) {
      const name = source.split("/").at(-1);
      return !GENERATED_DIR_NAMES.has(name) && name !== ".git";
    },
  });
  await processTemplateFiles(targetDir, tokens);
}

async function processTemplateFiles(dir, tokens) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await processTemplateFiles(fullPath, tokens);
      continue;
    }

    const content = await readFile(fullPath, "utf8");
    await writeFile(fullPath, replaceTokens(content, tokens));

    const nextName = replaceTokens(entry.name, tokens);
    if (nextName !== entry.name) {
      await rename(fullPath, join(dirname(fullPath), nextName));
    }
  }
}

export async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

export function relativeFrom(root, path) {
  return relative(root, path).replaceAll("\\", "/");
}

export function extractStringField(content, field) {
  const match = content.match(new RegExp(`${field}:\\s*["'\`]([^"'\`]+)["'\`]`));
  return match?.[1];
}

export function exportTargets(exportsMap) {
  const targets = [];

  function visit(value) {
    if (typeof value === "string") {
      targets.push(value);
      return;
    }
    if (value && typeof value === "object") {
      for (const nested of Object.values(value)) visit(nested);
    }
  }

  visit(exportsMap);
  return [...new Set(targets)].filter((target) => !target.includes("*"));
}
