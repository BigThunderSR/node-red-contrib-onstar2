"use strict";

/**
 * Verify that every third-party GitHub Action referenced by an active workflow
 * is pinned to an immutable 40-character commit SHA.
 *
 * Mutable references (`@main`, `@master`, `@v4`, `@v4.37.7`, partial SHAs) can be
 * silently repointed by the action owner, letting CI execute changed code without
 * a corresponding change to this repository — a CI/CD supply-chain risk.
 *
 * Scans `.github/workflows/*.{yml,yaml}` only (the workflows GitHub actually runs).
 * Local actions (`uses: ./...`) and Docker refs (`uses: docker://...`) are exempt.
 * A trailing `# vX.Y.Z` comment on a pinned line is expected and ignored.
 */

const fs = require("fs");
const path = require("path");

const workflowsDir = path.join(__dirname, "..", ".github", "workflows");

// A pinned ref is `@` followed by exactly 40 hex characters.
const SHA_RE = /^[0-9a-f]{40}$/;

// Capture the `uses:` value on a step line, ignoring any trailing `# comment`.
const USES_RE = /^\s*(?:-\s*)?uses:\s*([^\s#]+)/;

function listWorkflowFiles() {
    let entries;
    try {
        entries = fs.readdirSync(workflowsDir);
    } catch {
        return [];
    }
    return entries
        .filter(name => name.endsWith(".yml") || name.endsWith(".yaml"))
        .map(name => path.join(workflowsDir, name));
}

// Return the offending `uses` references (mutable, third-party) in a file.
function findMutableRefs(filePath) {
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    const violations = [];
    lines.forEach((line, i) => {
        // Skip commented-out lines.
        if (/^\s*#/.test(line)) return;
        const m = line.match(USES_RE);
        if (!m) return;
        const ref = m[1];
        // Exempt local composite actions and Docker image references.
        if (ref.startsWith("./") || ref.startsWith("docker://")) return;
        const atIndex = ref.lastIndexOf("@");
        // No `@ref` at all (e.g. a local reusable workflow) — not a pinning concern.
        if (atIndex === -1) return;
        const version = ref.slice(atIndex + 1);
        if (!SHA_RE.test(version)) {
            violations.push({ line: i + 1, ref });
        }
    });
    return violations;
}

const files = listWorkflowFiles();

if (files.length === 0) {
    console.log("No workflow files found under .github/workflows/.");
    process.exit(0);
}

console.log(`Checking ${files.length} workflow file(s) for immutable action pins...\n`);

let failed = 0;
let passed = 0;

for (const file of files.sort()) {
    const rel = path.relative(path.join(__dirname, ".."), file);
    const violations = findMutableRefs(file);
    if (violations.length === 0) {
        passed++;
        continue;
    }
    for (const v of violations) {
        console.error(`  ✗ ${rel}:${v.line}`);
        console.error(`    uses: ${v.ref}`);
        failed++;
    }
}

if (failed > 0) {
    console.error(
        `\n${failed} action reference(s) use a mutable tag or branch. ` +
        "Pin each to a full 40-character commit SHA, keeping a trailing " +
        "`# vX.Y.Z` comment so Dependabot/Renovate can still update it, e.g.:"
    );
    console.error(
        "    uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7"
    );
    process.exit(1);
} else {
    console.log(`  All action references in ${passed} workflow file(s) are pinned to commit SHAs.`);
}
