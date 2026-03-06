#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const lockPath = path.join(repoRoot, "package-lock.json");

if (!fs.existsSync(lockPath)) {
  console.error("Missing root package-lock.json");
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
const packages = lock.packages ?? {};

const expectedManifests = [
  { dir: "", manifest: "package.json" },
  { dir: "apps/web", manifest: "apps/web/package.json" },
  { dir: "packages/config", manifest: "packages/config/package.json" },
  { dir: "packages/database", manifest: "packages/database/package.json" },
];

const errors = [];

for (const target of expectedManifests) {
  const manifestPath = path.join(repoRoot, target.manifest);
  if (!fs.existsSync(manifestPath)) {
    errors.push(`Missing manifest: ${target.manifest}`);
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const lockEntry = packages[target.dir];

  if (!lockEntry) {
    errors.push(`Missing lock entry: ${target.dir || "<root>"}`);
    continue;
  }

  if (manifest.version && lockEntry.version !== manifest.version) {
    errors.push(
      `Version mismatch for ${target.dir || "<root>"}: lock=${lockEntry.version}, package=${manifest.version}`
    );
  }

  for (const section of ["dependencies", "devDependencies"]) {
    const manifestDeps = manifest[section] ?? {};
    const lockDeps = lockEntry[section] ?? {};

    for (const [name, range] of Object.entries(manifestDeps)) {
      if (lockDeps[name] !== range) {
        errors.push(
          `${target.dir || "<root>"} ${section}.${name} mismatch: lock=${lockDeps[name] ?? "<missing>"}, package=${range}`
        );
      }
    }
  }
}

const staleWorkspaceLock = path.join(repoRoot, "apps/web/package-lock.json");
if (fs.existsSync(staleWorkspaceLock)) {
  errors.push(
    "Found stale workspace lockfile: apps/web/package-lock.json (use root package-lock.json as single source of truth)"
  );
}

if (errors.length > 0) {
  console.error("Workspace lock verification failed:");
  for (const entry of errors) {
    console.error(`- ${entry}`);
  }
  process.exit(1);
}

console.log("Workspace lock verification passed.");
