#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectExtensionEntries,
  isPortOpen,
  openUrl,
  parseFlags,
  runCommand,
  sandboxPathFor,
  writeDevManifest,
} from "../src/dev-session.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");

function usage() {
  console.log(`Radarboard Extension Tools

Usage:
  radarboard-extension create <integration|plugin|widget> <name>
  radarboard-extension create package <name> [--integration] [--plugin] [--widget] [--out <dir>]
  radarboard-extension connect --radarboard <path>
  radarboard-extension dev --radarboard <path> [--port 1355] [--no-open]
  radarboard-extension validate [--extensions-only] [--secrets-only]
  radarboard-extension catalog
  radarboard-extension submit-check
  radarboard-extension doctor
`);
}

function runScript(script, args = [], options = {}) {
  const result = runCommand(
    "node",
    [join(repoRoot, "scripts", script), ...args],
    options.cwd ?? repoRoot
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function commandCreate(args) {
  const flags = parseFlags(args);
  const [kind, name] = flags._;
  const rest = args.slice(2);
  if (kind === "package") {
    runScript("scaffold-extension-repo.mjs", [name, ...rest]);
    return;
  }
  if (!["integration", "plugin", "widget"].includes(kind) || !name) {
    usage();
    process.exit(1);
  }
  if (
    process.cwd() !== repoRoot &&
    !existsSync(join(process.cwd(), "radarboard.community.config.js"))
  ) {
    console.error(
      `Single ${kind} creation is for the community-extensions repo. ` +
        `Use "radarboard-extension create package ${name} --${kind}" to create a standalone contributor repo.`
    );
    process.exit(1);
  }
  runScript("create-extension.mjs", [kind, name], { cwd: process.cwd() });
}

async function commandConnect(args) {
  const flags = parseFlags(args);
  const radarboardRoot = flags.radarboard ? resolve(String(flags.radarboard)) : null;
  if (!radarboardRoot) {
    console.error("Missing --radarboard <path>");
    process.exit(1);
  }
  if (!existsSync(join(radarboardRoot, "radarboard.config.ts"))) {
    console.error(`Not a Radarboard source checkout: ${radarboardRoot}`);
    process.exit(1);
  }
  const entries = await detectExtensionEntries(process.cwd());
  if (entries.length === 0) {
    console.error("Could not detect a Radarboard extension in the current directory.");
    process.exit(1);
  }
  const result = await writeDevManifest({ radarboardRoot, entries });
  console.log(`Wrote ${result.manifestPath}`);
  for (const entry of result.devExtensions) {
    console.log(`- ${entry.type}: ${entry.path}`);
  }
}

async function commandDev(args) {
  const flags = parseFlags(args);
  await commandConnect(args);
  const radarboardRoot = resolve(String(flags.radarboard));
  const generate = runCommand("pnpm", ["generate:extensions"], radarboardRoot);
  if (generate.status !== 0) process.exit(generate.status ?? 1);

  const entries = await detectExtensionEntries(process.cwd());
  const port = Number(flags.port ?? 1355);
  const path = sandboxPathFor(entries[0]?.type);
  const url = `http://localhost:${port}${path}`;
  const running = await isPortOpen(port);
  if (!running) {
    console.log(`Radarboard dev server is not responding on port ${port}. Start it with:`);
    console.log(`  cd ${radarboardRoot}`);
    console.log("  pnpm dev");
  }
  console.log(`Sandbox: ${url}`);
  if (!flags["no-open"]) openUrl(url);
}

async function commandValidate(args) {
  const flags = parseFlags(args);
  if (flags["secrets-only"]) {
    runScript("secret-scan.mjs");
    return;
  }
  if (flags["extensions-only"]) {
    runScript("check-extensions.mjs", args.filter(Boolean));
    return;
  }
  runScript("validate-all.mjs");
}

async function commandSubmitCheck() {
  runScript("validate-all.mjs");
  runScript("generate-catalog.mjs");
  console.log("Submission check passed.");
}

async function commandDoctor() {
  console.log("Radarboard extension doctor");
  console.log(`Repository tools root: ${repoRoot}`);
  for (const path of ["integrations/_template", "plugins/_template", "widgets/_template"]) {
    console.log(`${existsSync(join(repoRoot, path)) ? "ok" : "missing"} ${path}`);
  }
  const entries = await detectExtensionEntries(process.cwd());
  if (entries.length > 0) {
    console.log("Detected current extension entries:");
    for (const entry of entries) console.log(`- ${entry.type}: ${entry.path}`);
  } else {
    console.log("No extension detected in current directory.");
  }
}

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

if (command === "create") await commandCreate(args);
else if (command === "connect") await commandConnect(args);
else if (command === "dev") await commandDev(args);
else if (command === "validate") await commandValidate(args);
else if (command === "catalog") runScript("generate-catalog.mjs");
else if (command === "submit-check") await commandSubmitCheck();
else if (command === "doctor") await commandDoctor();
else {
  usage();
  process.exit(1);
}
