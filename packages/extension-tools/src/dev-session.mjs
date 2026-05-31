import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import { dirname, join, relative, resolve } from "node:path";
import { expectedPackageName, readJson } from "../../../scripts/lib/extension-utils.mjs";

export const DEV_MANIFEST_PATH = ".radarboard/dev-extensions.json";

export function parseFlags(argv) {
  const flags = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      flags._.push(arg);
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split("=");
    const next = argv[index + 1];
    if (inlineValue !== undefined) {
      flags[key] = inlineValue;
    } else if (next && !next.startsWith("--")) {
      flags[key] = next;
      index += 1;
    } else {
      flags[key] = true;
    }
  }
  return flags;
}

export async function detectExtensionEntries(cwd = process.cwd()) {
  const manifestPath = join(cwd, "radarboard-extension.json");
  if (existsSync(manifestPath)) {
    const manifest = await readJson(manifestPath);
    return (manifest.extensions ?? []).map((entry) => ({
      type: entry.type,
      path: resolve(cwd, entry.path),
      packageName: entry.name,
    }));
  }

  const packagePath = join(cwd, "package.json");
  if (existsSync(packagePath)) {
    const pkg = await readJson(packagePath);
    for (const type of ["integration", "plugin", "widget"]) {
      const expectedPrefix = expectedPackageName(type, "");
      if (pkg.name?.startsWith(expectedPrefix)) {
        return [{ type, path: cwd, packageName: pkg.name }];
      }
    }
  }

  for (const type of ["integration", "plugin", "widget"]) {
    const packagePathInDir = join(cwd, `${type}s`, "package.json");
    if (existsSync(packagePathInDir)) {
      const pkg = await readJson(packagePathInDir);
      return [{ type, path: dirname(packagePathInDir), packageName: pkg.name }];
    }
  }

  return [];
}

export function sandboxPathFor(type) {
  if (type === "plugin") return "/debug/plugin-sandbox";
  if (type === "integration") return "/debug/integration-sandbox";
  return "/debug/widget-sandbox";
}

export function makeDevManifestEntries(entries, radarboardRoot) {
  return entries.map((entry) => ({
    type: entry.type,
    path: relative(radarboardRoot, entry.path).replaceAll("\\", "/"),
  }));
}

export async function writeDevManifest({ radarboardRoot, entries }) {
  const manifestPath = join(radarboardRoot, DEV_MANIFEST_PATH);
  await mkdir(dirname(manifestPath), { recursive: true });
  const devExtensions = makeDevManifestEntries(entries, radarboardRoot);
  await writeFile(manifestPath, `${JSON.stringify({ devExtensions }, null, 2)}\n`);
  return { manifestPath, devExtensions };
}

export async function readDevManifest(radarboardRoot) {
  const manifestPath = join(radarboardRoot, DEV_MANIFEST_PATH);
  if (!existsSync(manifestPath)) return { devExtensions: [] };
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

export function runCommand(command, args, cwd) {
  return spawnSync(command, args, { cwd, stdio: "inherit" });
}

export function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolvePort) => {
    const socket = net.createConnection({ host, port, timeout: 500 });
    socket.on("connect", () => {
      socket.destroy();
      resolvePort(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolvePort(false);
    });
    socket.on("error", () => resolvePort(false));
  });
}

export function openUrl(url) {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", url] : [url];
  return spawnSync(command, args, { stdio: "ignore" });
}
