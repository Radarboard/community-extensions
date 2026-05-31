#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  collectFiles,
  EXTENSION_TYPES,
  expectedPackageName,
  exportTargets,
  extractStringField,
  GENERATED_DIR_NAMES,
  listAllExtensions,
  readJson,
  relativeFrom,
} from "./lib/extension-utils.mjs";

const LARGE_DEPS = new Set([
  "moment",
  "lodash",
  "rxjs",
  "three",
  "d3",
  "pdf-lib",
  "pdfjs-dist",
  "xlsx",
]);
const ALWAYS_ALLOWED_DEV_DEPS = new Set(["@radarboard/tsconfig"]);
const PLACEHOLDER_PATTERNS = [/TODO/i, /example\.com/i, /Your Name/i, /Replace this/i];

function parseArgs(argv) {
  const args = { root: process.cwd(), filter: undefined, verbose: false, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--verbose") args.verbose = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--root") args.root = argv[++index];
    else if (arg.startsWith("--root=")) args.root = arg.slice("--root=".length);
    else if (arg === "--filter") args.filter = argv[++index];
    else if (arg.startsWith("--filter=")) args.filter = arg.slice("--filter=".length);
  }
  return args;
}

function result(name, status, message) {
  return { name, status, ...(message ? { message } : {}) };
}

async function readPackage(extension) {
  const pkgPath = join(extension.dir, "package.json");
  if (!existsSync(pkgPath)) return null;
  return readJson(pkgPath);
}

function dependencyNames(pkg) {
  return {
    deps: Object.keys(pkg.dependencies ?? {}),
    devDeps: Object.keys(pkg.devDependencies ?? {}),
  };
}

async function checkPackageStructure(extension) {
  const checks = [];
  const pkg = await readPackage(extension);
  if (!pkg) return [result("package.json exists", "error", "Missing package.json")];

  checks.push(result("package.json exists", "pass"));

  const expected = expectedPackageName(extension.type, extension.id);
  checks.push(
    pkg.name === expected
      ? result("package name convention", "pass")
      : result(
          "package name convention",
          "error",
          `Expected ${expected}, got ${pkg.name ?? "(missing)"}`
        )
  );

  checks.push(
    pkg.private === true
      ? result("private package", "pass")
      : result("private package", "warn", "Community extension packages should set private: true")
  );

  checks.push(
    pkg.exports && typeof pkg.exports === "object" && pkg.exports["."]
      ? result("default export", "pass")
      : result("default export", "error", 'Missing package.json exports["."]')
  );

  const targets = exportTargets(pkg.exports ?? {});
  const missingTargets = targets.filter((target) => !existsSync(join(extension.dir, target)));
  if (missingTargets.length > 0) {
    checks.push(result("export targets", "error", `Missing files: ${missingTargets.join(", ")}`));
  } else if (targets.length > 0) {
    checks.push(result("export targets", "pass"));
  }

  const deps = pkg.dependencies ?? {};
  const sdkPackage = EXTENSION_TYPES[extension.type].sdkPackage;
  checks.push(
    deps[sdkPackage]
      ? result("sdk dependency", "pass")
      : result("sdk dependency", "error", `Missing dependency ${sdkPackage}`)
  );

  return checks;
}

async function checkModuleBoundaries(extension) {
  const checks = [];
  const pkg = await readPackage(extension);
  if (!pkg) return checks;

  const ownPackage = expectedPackageName(extension.type, extension.id);
  const allowed = EXTENSION_TYPES[extension.type].allowedWorkspaceDeps;
  const violations = [];
  const { deps, devDeps } = dependencyNames(pkg);

  for (const dep of deps) {
    if (!dep.startsWith("@radarboard/") || dep === ownPackage || allowed.has(dep)) continue;
    violations.push(`Forbidden dependency: ${dep}`);
  }

  for (const dep of devDeps) {
    if (
      !dep.startsWith("@radarboard/") ||
      dep === ownPackage ||
      allowed.has(dep) ||
      ALWAYS_ALLOWED_DEV_DEPS.has(dep)
    )
      continue;
    violations.push(`Unexpected devDependency: ${dep}`);
  }

  const sourceFiles = await collectFiles(join(extension.dir, "src"), {
    includeTests: false,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  });
  const importRegex = /(?:from|import)\s+["'](@radarboard\/[^"']+)["']/g;
  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(importRegex)) {
      const importName = match[1];
      if (importName === ownPackage || importName.startsWith(`${ownPackage}/`)) continue;
      if ([...allowed].some((dep) => importName === dep || importName.startsWith(`${dep}/`)))
        continue;
      if (
        EXTENSION_TYPES[extension.type].forbiddenImportPrefixes.some((prefix) =>
          importName.startsWith(prefix)
        )
      ) {
        violations.push(`${relativeFrom(extension.dir, file)} imports ${importName}`);
      }
    }
  }

  checks.push(
    violations.length === 0
      ? result("module boundaries", "pass")
      : result("module boundaries", "error", violations.join("; "))
  );
  return checks;
}

async function checkTests(extension) {
  const files = await collectFiles(extension.dir, {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  });
  const testFiles = files.filter((file) => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file));
  const conformanceFunction = EXTENSION_TYPES[extension.type].conformanceFunction;
  const hasConformance = await asyncSome(testFiles, async (file) =>
    (await readFile(file, "utf8")).includes(conformanceFunction)
  );

  return [
    testFiles.length > 0
      ? result("test files exist", "pass")
      : result("test files exist", "error", "No .test or .spec files found"),
    hasConformance
      ? result("conformance test", "pass")
      : result("conformance test", "error", `No test references ${conformanceFunction}`),
  ];
}

async function asyncSome(items, predicate) {
  for (const item of items) {
    if (await predicate(item)) return true;
  }
  return false;
}

async function checkDocumentation(extension) {
  const readmePath = join(extension.dir, "README.md");
  const changelogPath = join(extension.dir, "CHANGELOG.md");
  const checks = [];

  if (!existsSync(readmePath)) {
    checks.push(result("README", "error", "Missing README.md"));
  } else {
    const readme = await readFile(readmePath, "utf8");
    const requiredSections = ["setup", "limitations"];
    const missing = requiredSections.filter(
      (section) => !new RegExp(`^##\\s+${section}`, "im").test(readme)
    );
    if (missing.length > 0) {
      checks.push(result("README", "error", `Missing sections: ${missing.join(", ")}`));
    } else if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(readme))) {
      checks.push(result("README", "warn", "README still appears to contain placeholder text"));
    } else {
      checks.push(result("README", "pass"));
    }
  }

  checks.push(
    existsSync(changelogPath)
      ? result("CHANGELOG", "pass")
      : result("CHANGELOG", "error", "Missing CHANGELOG.md")
  );

  return checks;
}

async function checkDescriptor(extension) {
  const pkg = await readPackage(extension);
  if (!pkg?.exports?.["."]) return [];

  const entryTarget =
    typeof pkg.exports["."] === "string" ? pkg.exports["."] : exportTargets(pkg.exports["."])[0];
  const entryPath = join(extension.dir, entryTarget);
  if (!entryTarget || !existsSync(entryPath)) return [];

  const content = await readFile(entryPath, "utf8");
  const descriptorPattern = /export\s+(?:const|let)\s+\w+Descriptor\b/;
  const checks = [
    descriptorPattern.test(content)
      ? result("descriptor export", "pass")
      : result("descriptor export", "error", "Default entry should export const <name>Descriptor"),
  ];

  const name = extractStringField(content, "name");
  const description = extractStringField(content, "description");
  if (!name || !description) {
    checks.push(
      result("descriptor metadata", "error", "Descriptor should include name and description")
    );
  } else if (
    PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(name) || pattern.test(description))
  ) {
    checks.push(
      result(
        "descriptor metadata",
        "warn",
        "Descriptor metadata still appears to contain placeholders"
      )
    );
  } else {
    checks.push(result("descriptor metadata", "pass"));
  }

  if (extension.type === "integration") {
    checks.push(...checkIntegrationCapabilities(content));
  }

  return checks;
}

function checkIntegrationCapabilities(content) {
  const capabilityActions = [...content.matchAll(/action:\s*["']([^"']+)["']/g)].map(
    (match) => match[1]
  );
  if (capabilityActions.length === 0) return [];
  return [result("capability metadata", "pass")];
}

async function checkBundleImpact(extension) {
  const pkg = await readPackage(extension);
  if (!pkg) return [];

  const externalDeps = Object.keys(pkg.dependencies ?? {}).filter(
    (dep) => !dep.startsWith("@radarboard/") && dep !== "react" && dep !== "react-dom"
  );
  const checks = [];
  checks.push(
    externalDeps.length <= 6
      ? result("external dependency count", "pass")
      : result(
          "external dependency count",
          "warn",
          `Has ${externalDeps.length} external dependencies`
        )
  );
  const largeDeps = externalDeps.filter((dep) => LARGE_DEPS.has(dep));
  if (largeDeps.length > 0) {
    checks.push(
      result("large dependencies", "warn", `Review heavy dependencies: ${largeDeps.join(", ")}`)
    );
  }
  return checks;
}

async function checkGeneratedArtifacts(extension) {
  const offenders = [...GENERATED_DIR_NAMES]
    .filter((name) => name !== "node_modules")
    .map((name) => join(extension.dir, name))
    .filter((path) => existsSync(path));
  return [
    offenders.length === 0
      ? result("generated artifacts", "pass")
      : result(
          "generated artifacts",
          "error",
          `Remove generated artifacts: ${offenders.slice(0, 5).join(", ")}`
        ),
  ];
}

async function checkManifestPackage(extension) {
  const manifestPath = join(extension.dir, "radarboard-extension.json");
  if (!existsSync(manifestPath)) return [];
  const manifest = await readJson(manifestPath);
  const checks = [];
  if (
    !manifest.name ||
    !manifest.description ||
    !manifest.author?.name ||
    !Array.isArray(manifest.extensions)
  ) {
    checks.push(
      result(
        "extension package manifest",
        "error",
        "Manifest requires name, description, author.name, and extensions[]"
      )
    );
  } else {
    checks.push(result("extension package manifest", "pass"));
  }
  return checks;
}

async function checkExtension(extension) {
  const checks = [
    ...(await checkPackageStructure(extension)),
    ...(await checkModuleBoundaries(extension)),
    ...(await checkTests(extension)),
    ...(await checkDocumentation(extension)),
    ...(await checkDescriptor(extension)),
    ...(await checkBundleImpact(extension)),
    ...(await checkGeneratedArtifacts(extension)),
    ...(await checkManifestPackage(extension)),
  ];
  return { ...extension, checks };
}

async function auditCanonicalCapabilities(reports) {
  const canonical = new Map();
  for (const report of reports.filter((item) => item.type === "widget")) {
    const pkg = await readPackage(report);
    if (!pkg?.exports?.["."]) continue;
    const entryTarget =
      typeof pkg.exports["."] === "string" ? pkg.exports["."] : exportTargets(pkg.exports["."])[0];
    const entryPath = entryTarget ? join(report.dir, entryTarget) : null;
    if (!entryPath || !existsSync(entryPath)) continue;
    const content = await readFile(entryPath, "utf8");
    for (const match of content.matchAll(/capabilities:\s*\[([\s\S]*?)\]\s*,/g)) {
      const block = match[1];
      const id = block.match(/id:\s*["']([^"']+)["']/)?.[1];
      const role = block.match(/role:\s*["']([^"']+)["']/)?.[1];
      if (!id || role !== "canonical") continue;
      const capability = id;
      const owners = canonical.get(capability) ?? [];
      owners.push(report);
      canonical.set(capability, owners);
    }
  }

  for (const [capability, owners] of canonical.entries()) {
    if (owners.length <= 1) continue;
    for (const owner of owners) {
      owner.checks.push(
        result(
          "capability governance",
          "error",
          `Duplicate canonical widget for capability "${capability}"`
        )
      );
    }
  }
}

export async function runQualityCheck(options = {}) {
  const root = options.root ?? process.cwd();
  const filter = options.filter;
  if (filter && !EXTENSION_TYPES[filter]) {
    throw new Error(`Unknown extension filter: ${filter}`);
  }

  const extensions = await listAllExtensions(root, filter);
  const reports = [];
  for (const extension of extensions) reports.push(await checkExtension(extension));
  await auditCanonicalCapabilities(reports);
  return reports;
}

function summarize(reports) {
  let passed = 0;
  let warnings = 0;
  let errors = 0;
  for (const report of reports) {
    passed += report.checks.filter((check) => check.status === "pass").length;
    warnings += report.checks.filter((check) => check.status === "warn").length;
    errors += report.checks.filter((check) => check.status === "error").length;
  }
  return { passed, warnings, errors };
}

function printReport(reports, options) {
  console.log("\nExtension Quality Check Report\n");
  if (reports.length === 0) {
    console.log("No community extensions found. Templates are ignored.");
  }

  for (const report of reports) {
    const errors = report.checks.filter((check) => check.status === "error");
    const warnings = report.checks.filter((check) => check.status === "warn");
    const passed = report.checks.filter((check) => check.status === "pass");
    const mark = errors.length > 0 ? "x" : warnings.length > 0 ? "!" : "+";
    console.log(
      `${mark} ${report.type}/${report.id} - ${passed.length} passed, ${warnings.length} warnings, ${errors.length} errors`
    );
    for (const check of [...errors, ...warnings]) {
      console.log(`  ${check.status}: ${check.name}${check.message ? ` - ${check.message}` : ""}`);
    }
    if (options.verbose) {
      for (const check of passed) console.log(`  pass: ${check.name}`);
    }
  }

  const summary = summarize(reports);
  console.log(`\nExtensions checked: ${reports.length}`);
  console.log(
    `Passed: ${summary.passed}  Warnings: ${summary.warnings}  Errors: ${summary.errors}\n`
  );
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  try {
    const reports = await runQualityCheck(options);
    if (options.json) {
      console.log(JSON.stringify({ reports, summary: summarize(reports) }, null, 2));
    } else {
      const summary = printReport(reports, options);
      if (summary.errors > 0) process.exit(1);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
