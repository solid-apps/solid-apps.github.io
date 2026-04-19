#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

const RESERVED = new Set([
  "schema", "scripts", "node_modules", ".github", ".git", ".claude",
  "assets", "vendor", "spec", "demo", "template", "preact"
]);

const isAppDir = (name) => {
  if (RESERVED.has(name)) return false;
  if (name.startsWith(".")) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) return false;
  return fs.existsSync(path.join(ROOT, name, "app.json"));
};

const META = JSON.parse(fs.readFileSync(path.join(ROOT, "schema", "app.schema.json"), "utf8"));
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const validateMeta = ajv.compile(META);

const names = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(isAppDir)
  .sort();

let ok = 0;
let failed = 0;
for (const name of names) {
  const filePath = path.join(ROOT, name, "app.json");
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch (e) { console.error(`[validate] ${name}: malformed JSON — ${e.message}`); failed++; continue; }

  if (!validateMeta(manifest)) {
    console.error(`[validate] ${name}: failed manifest schema:`, validateMeta.errors);
    failed++;
    continue;
  }

  const entryPath = path.join(ROOT, name, manifest.entry);
  if (!fs.existsSync(entryPath)) {
    console.error(`[validate] ${name}: entry "${manifest.entry}" not found at ${entryPath}`);
    failed++;
    continue;
  }

  ok++;
}

console.log(`[validate] ${ok} ok, ${failed} failed`);
if (failed > 0) process.exit(1);
