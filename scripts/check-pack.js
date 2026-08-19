"use strict";

const { execSync } = require("child_process");
const path = require("path");

const pkg = require(path.join(__dirname, "..", "package.json"));

// Derive required files from node-red.nodes — both the JS and its paired HTML
const nodeEntries = Object.values(pkg["node-red"]?.nodes ?? {});
const required = [
  ...nodeEntries,
  ...nodeEntries.map((f) => f.replace(/\.js$/, ".html")),
];

if (required.length === 0) {
  console.error("No node-red.nodes entries found in package.json");
  process.exit(1);
}

const output = execSync("npm pack --dry-run --json 2>/dev/null", {
  encoding: "utf8",
  cwd: path.join(__dirname, ".."),
});

const [{ files }] = JSON.parse(output);
const packedPaths = new Set(files.map((f) => f.path));

const missing = required.filter((f) => !packedPaths.has(f));

if (missing.length > 0) {
  console.error("ERROR: Required node files are missing from the package:");
  missing.forEach((f) => console.error(`  - ${f}`));
  console.error('\nAdd them to the "files" array in package.json.');
  process.exit(1);
}

console.log(`Pack check passed (${files.length} files):`);
files.forEach((f) => console.log(`  ${f.path}`));
