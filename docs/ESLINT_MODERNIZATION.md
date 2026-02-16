# ESLint Configuration Modernization

## Summary

Modernized the ESLint configuration to use native flat config directly, removing all legacy compatibility layers. This eliminates blockers for future ESLint v10 migration and reduces devDependencies significantly.

## Changes Made

### 1. Removed `FlatCompat` / `@eslint/eslintrc`

**Before:** Used `FlatCompat` from `@eslint/eslintrc` to bridge the old eslintrc configuration format, solely to access `eslint:recommended`:

```js
const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat({ ... });
module.exports = [
    ...compat.extends("eslint:recommended"),
    { ... }
];
```

**After:** Uses `js.configs.recommended` directly from `@eslint/js`, which is the native flat config way:

```js
const js = require("@eslint/js");
module.exports = [
    js.configs.recommended,
    { ... }
];
```

### 2. Removed Babel Parser and Plugin

**Before:** Used `@babel/eslint-parser` and `@babel/eslint-plugin` with a `.babelrc` config file.

**After:** Removed entirely. The codebase is plain CommonJS Node.js — no JSX, no experimental syntax, no transpilation. ESLint's built-in parser handles it natively.

**Files removed:**

- `.babelrc`

**Packages removed:**

- `@babel/eslint-parser`
- `@babel/eslint-plugin`
- `@babel/plugin-syntax-class-properties`
- `@babel/preset-env`

### 3. Fixed `sourceType` and `ecmaVersion`

| Setting       | Before     | After        | Reason                                              |
| ------------- | ---------- | ------------ | --------------------------------------------------- |
| `sourceType`  | `"module"` | `"commonjs"` | All source files use `require()` / `module.exports` |
| `ecmaVersion` | `2018`     | `2022`       | Node.js 18+ supports well beyond ES2018             |

### 4. Removed Unnecessary Global Declarations

**Before:**

```js
globals: {
    ...globals.node,
    ...globals.browser,
    ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
    ...globals.commonjs,
    ...globals.mocha,
}
```

**After:**

```js
globals: {
    ...globals.node,
    ...globals.commonjs,
    ...globals.mocha,
}
```

- `globals.browser` was added then immediately overridden to `"off"` — a no-op.

### 5. Fixed Super-Linter CI Workflow

Upgraded from `github/super-linter@latest` to `super-linter/super-linter@v8`:

- **v7/latest → v8**: The old `github/super-linter` bundled ESLint 8 (crashed with `ERR_UNKNOWN_FILE_EXTENSION` on `.yml` config) and has a high severity security vulnerability. v8 bundles ESLint 9+ with native flat config support.
- **`USE_FIND_ALGORITHM: true`**: v8 doesn't support the `workflow_run` event type. Since `VALIDATE_ALL_CODEBASE: true` already lints all files, `USE_FIND_ALGORITHM` tells super-linter to discover files via filesystem scan instead of `git diff`, bypassing event validation entirely.
- **Removed `DEFAULT_BRANCH`**: Incompatible with `USE_FIND_ALGORITHM` (and unnecessary when validating all files).
- **Removed `ESLINT_USE_FLAT_CONFIG: false`**: No longer needed — v8 uses flat config natively.
- **`JAVASCRIPT_ES_CONFIG_FILE: eslint.config.cjs`**: Points super-linter's ESLint at the project's flat config (was previously commented out).
- **Added `run-name`**: Provides descriptive workflow run names in the GitHub Actions UI.

## DevDependencies Before vs After

### Removed (5 packages)

- `@babel/eslint-parser`
- `@babel/eslint-plugin`
- `@babel/plugin-syntax-class-properties`
- `@babel/preset-env`
- `@eslint/eslintrc`

### Remaining (9 packages)

- `@eslint/js`
- `c8`
- `dotenv`
- `eslint`
- `globals`
- `mocha`
- `node-red`
- `node-red-node-test-helper`
- `sinon`

**Net result:** 130 packages pruned from `node_modules`.

## ESLint v10 Readiness

This modernization removes the primary blockers for a future ESLint v10 upgrade:

| ESLint v10 Requirement               | Status                               |
| ------------------------------------ | ------------------------------------ |
| No old config format / `FlatCompat`  | Solved                               |
| Super-linter v8 with ESLint 9+       | Solved                               |
| No `eslint-env` comments in source   | Already clean                        |
| Node.js >= v18                       | Using Node.js 18+                    |
| Plugin peer dependency compatibility | No third-party ESLint plugins remain |

**Remaining v10 considerations** (for when upgrading `eslint` and `@eslint/js` to v10):

- `eslint:recommended` adds 3 new rules: `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`.
  - `no-useless-assignment` has been pre-emptively disabled in `eslint.config.cjs` to preserve intentional clarity assignments.
  - The other two rules produced no violations in the current codebase.
- Config lookup algorithm changes (searches from file, not cwd) — unlikely to affect this project since `eslint.config.cjs` is at the repo root.

## Verification

All checks pass after these changes:

| Check                                  | Result                                      |
| -------------------------------------- | ------------------------------------------- |
| `npx eslint onstar.js deps/vehicle.js` | 0 errors                                    |
| `npm test`                             | 76/76 passing                               |
| Coverage                               | 98.2% statement coverage                    |
| Lint rules (old vs new)                | Identical — same `eslint:recommended` rules |
| All source file `require()` chains     | Resolve correctly                           |
| All 5 production dependencies          | Resolve correctly                           |
| Stale references to removed packages   | None in active code                         |
| Renovate / Dependabot configs          | No package-specific refs to removed deps    |
