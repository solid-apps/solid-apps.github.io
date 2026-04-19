#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

const RESERVED = new Set([
  "schema", "scripts", "node_modules", ".github", ".git", ".claude",
  "assets", "vendor", "spec", "demo", "template"
]);

const isAppDir = (name) => {
  if (RESERVED.has(name)) return false;
  if (name.startsWith(".")) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) return false;
  return fs.existsSync(path.join(ROOT, name, "app.json"));
};

const writeIfChanged = (file, content) => {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false;
  fs.writeFileSync(file, content);
  return true;
};

const main = () => {
  const names = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(isAppDir)
    .sort();

  const catalog = {};
  const corpusLines = [];
  const reverseIndex = {};

  for (const name of names) {
    const srcPath = path.join(ROOT, name, "app.json");
    const jsonText = fs.readFileSync(srcPath, "utf8");
    let manifest;
    try { manifest = JSON.parse(jsonText); }
    catch (e) { console.error(`[build] ${srcPath}: malformed JSON — ${e.message}`); process.exit(1); }

    catalog[name] = {
      name: manifest.name,
      description: manifest.description,
      entry: `/${name}/${manifest.entry.replace(/^\.\//, "")}`,
      types: manifest.types,
      icon: manifest.icon,
      status: manifest.status,
      manifest: `/${name}/app.json`
    };

    for (const t of manifest.types) {
      if (!reverseIndex[t]) reverseIndex[t] = [];
      reverseIndex[t].push(`/${name}/`);
    }

    corpusLines.push(JSON.stringify(manifest));
  }

  const catalogChanged = writeIfChanged(path.join(ROOT, "index.json"), JSON.stringify(catalog, null, 2) + "\n");
  const reverseChanged = writeIfChanged(path.join(ROOT, "reverse-index.json"), JSON.stringify(reverseIndex, null, 2) + "\n");
  const corpusChanged = writeIfChanged(path.join(ROOT, "corpus.jsonl"), corpusLines.join("\n") + "\n");

  console.log(`[build] ${names.length} apps — index.json ${catalogChanged ? "updated" : "unchanged"}, reverse-index.json ${reverseChanged ? "updated" : "unchanged"}, corpus.jsonl ${corpusChanged ? "updated" : "unchanged"}`);
};

main();
