#!/usr/bin/env node
// Scaffold a new app from template/.
//
// Usage:
//   npm run new-app -- <slug> <Type> <icon> <description>
//   npm run new-app -- contacts AddressBook 📒 "An address book"
//
// Creates <slug>/{index.html, app.json, <slug>-view-pane.js} from
// template/, substituting placeholders. Then prints a 6-repo checklist.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const TEMPLATE = path.join(ROOT, "template");

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error("Usage: npm run new-app -- <slug> <Type> <icon> <description>");
  console.error('Example: npm run new-app -- contacts AddressBook 📒 "An address book"');
  process.exit(1);
}

const [slug, type, icon, description] = args;

if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error("slug must be lowercase, alphanumeric + dashes (e.g. 'address-book')");
  process.exit(1);
}
if (!/^[A-Z][A-Za-z0-9]*$/.test(type)) {
  console.error("type must be PascalCase (e.g. 'AddressBook')");
  process.exit(1);
}

const dest = path.join(ROOT, slug);
if (fs.existsSync(dest)) {
  console.error(`${slug}/ already exists — refusing to overwrite`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const label = type.replace(/([A-Z])/g, ' $1').trim();

const subst = (s) => s
  .replaceAll("{{SLUG}}", slug)
  .replaceAll("{{TYPE}}", type)
  .replaceAll("{{LABEL}}", label)
  .replaceAll("{{ICON}}", icon)
  .replaceAll("{{DESCRIPTION}}", description)
  .replaceAll("{{TODAY}}", today);

fs.mkdirSync(dest);

const writes = [
  ["index.html", "index.html"],
  ["app.json", "app.json"],
  ["view-pane.js", `${slug}-view-pane.js`],
];

for (const [src, out] of writes) {
  const content = subst(fs.readFileSync(path.join(TEMPLATE, src), "utf8"));
  fs.writeFileSync(path.join(dest, out), content);
  console.log(`  wrote ${slug}/${out}`);
}

console.log(`\n  ${slug}/ scaffolded for urn:solid:${type}\n`);
console.log("Next — make sure these are in place across the 6 repos:");
console.log(`  1. urn-solid:    Class term ${type}/index.json (+ any new properties)`);
console.log(`  2. solid-schema: ${type}/index.json (JSON Schema)`);
console.log(`  3. solid-shapes: npm run build  (auto-derives from solid-schema)`);
console.log(`  4. solid-ui:     npm run build  (auto-derives from solid-schema)`);
console.log(`  5. solid-panes:  ${type}/index.json manifest`);
console.log(`  6. solid-apps:   edit ${slug}/index.html — replace the sample data`);
console.log(`                   then npm run build && commit + push`);
console.log("\nIf any of 1-5 are missing the Edit/View tabs will not appear.\n");
