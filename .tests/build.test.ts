/**
 * Phase 1 — Build & TypeScript Integrity Test
 *
 * Runs `tsc --noEmit` and checks:
 * - Zero TypeScript errors
 * - No stale imports from deleted Polar / payments files
 * - package.json metadata updated correctly
 * - Required packages installed
 *
 * Run: node --experimental-strip-types .tests/build.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

function readJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf-8")) as Record<string, unknown>;
}

function grepSrc(pattern: string): string[] {
  try {
    const out = execSync(
      `grep -rl "${pattern}" "${resolve(ROOT, "src")}" --include="*.ts" --include="*.tsx" 2>/dev/null`,
      { encoding: "utf-8" }
    );
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

// ─── TypeScript ───────────────────────────────────────────────────────────────

describe("TypeScript compilation", () => {

  it("tsc --noEmit exits with 0 errors", () => {
    let output = "";
    try {
      // Use the project-local tsc via npx
      const nvmLoader = `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && `;
      output = execSync(
        `bash -c '${nvmLoader} cd "${ROOT}" && npx tsc --noEmit 2>&1'`,
        { encoding: "utf-8", timeout: 60_000 }
      );
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      output = err.stdout ?? err.stderr ?? err.message ?? String(e);
    }

    const errorLines = output
      .split("\n")
      .filter((l) => l.includes("error TS"));

    assert.equal(
      errorLines.length,
      0,
      `TypeScript compilation has ${errorLines.length} error(s):\n${errorLines.join("\n")}`
    );
  });

});

// ─── Stale import checks ──────────────────────────────────────────────────────

describe("No stale Polar imports in src/", () => {

  it("no file imports from @polar-sh/*", () => {
    const files = grepSrc("@polar-sh");
    assert.deepEqual(files, [],
      `Files still importing @polar-sh:\n  ${files.join("\n  ")}`);
  });

  it("no file imports from ~/db/schema/payments", () => {
    const files = grepSrc("db/schema/payments");
    assert.deepEqual(files, [],
      `Files still importing Polar payments schema:\n  ${files.join("\n  ")}`);
  });

  it("no file imports PaymentForm from polar component path", () => {
    const files = grepSrc("components/payments/PaymentForm");
    assert.deepEqual(files, [],
      `Files still importing old PaymentForm:\n  ${files.join("\n  ")}`);
  });

  it("no file imports Polar SDK", () => {
    const files = grepSrc("@polar-sh/sdk");
    assert.deepEqual(files, [],
      `Files still importing @polar-sh/sdk:\n  ${files.join("\n  ")}`);
  });

});

// ─── package.json ─────────────────────────────────────────────────────────────

describe("package.json", () => {

  it("name is 'ashi-tea'", () => {
    const pkg = readJson("package.json");
    assert.equal(pkg.name, "ashi-tea");
  });

  it("next-intl is listed as dependency", () => {
    const pkg = readJson("package.json");
    const deps = pkg.dependencies as Record<string, string> ?? {};
    assert.ok("next-intl" in deps, "next-intl not in dependencies");
  });

  it("resend is listed as dependency", () => {
    const pkg = readJson("package.json");
    const deps = pkg.dependencies as Record<string, string> ?? {};
    assert.ok("resend" in deps, "resend not in dependencies");
  });

  it("@polar-sh packages are NOT in dependencies", () => {
    const pkg = readJson("package.json");
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) } as Record<string, string>;
    const polar = Object.keys(deps).filter((k) => k.startsWith("@polar-sh"));
    assert.deepEqual(polar, [],
      `Polar packages still in package.json: ${polar.join(", ")}`);
  });

  it("next-intl is installed in node_modules", () => {
    assert.ok(
      existsSync(resolve(ROOT, "node_modules/next-intl")),
      "next-intl not installed — run npm install"
    );
  });

  it("resend is installed in node_modules", () => {
    assert.ok(
      existsSync(resolve(ROOT, "node_modules/resend")),
      "resend not installed — run npm install"
    );
  });

  it("better-auth is installed in node_modules", () => {
    assert.ok(
      existsSync(resolve(ROOT, "node_modules/better-auth")),
      "better-auth not installed"
    );
  });

  it("drizzle-orm is installed in node_modules", () => {
    assert.ok(
      existsSync(resolve(ROOT, "node_modules/drizzle-orm")),
      "drizzle-orm not installed"
    );
  });

});

// ─── Critical config files ────────────────────────────────────────────────────

describe("Configuration files integrity", () => {

  it("src/app.ts has ashi-tea brand name", () => {
    const src = readFileSync(resolve(ROOT, "src/app.ts"), "utf-8");
    assert.ok(src.includes("Ashi Tea"), "src/app.ts missing 'Ashi Tea' brand name");
  });

  it("src/app.ts does not reference Relivator", () => {
    const src = readFileSync(resolve(ROOT, "src/app.ts"), "utf-8");
    assert.ok(!src.includes("Relivator"), "src/app.ts still references 'Relivator'");
  });

  it("src/lib/auth.ts does not import @polar-sh/better-auth", () => {
    const src = readFileSync(resolve(ROOT, "src/lib/auth.ts"), "utf-8");
    assert.ok(!src.includes("@polar-sh/better-auth"),
      "auth.ts still imports @polar-sh/better-auth");
  });

  it("src/lib/auth.ts does not configure GitHub provider", () => {
    const src = readFileSync(resolve(ROOT, "src/lib/auth.ts"), "utf-8");
    // github: { ... } block should not exist
    assert.ok(!src.includes("AUTH_GITHUB_ID"),
      "auth.ts still references AUTH_GITHUB_ID");
  });

  it("src/lib/auth.ts configures Google provider", () => {
    const src = readFileSync(resolve(ROOT, "src/lib/auth.ts"), "utf-8");
    assert.ok(src.includes("AUTH_GOOGLE_ID"),
      "auth.ts missing Google OAuth config");
  });

  it("next.config.ts uses next-intl plugin", () => {
    const src = readFileSync(resolve(ROOT, "next.config.ts"), "utf-8");
    assert.ok(
      src.includes("next-intl/plugin") || src.includes("createNextIntlPlugin"),
      "next.config.ts should wrap config with next-intl plugin"
    );
  });

  it("src/i18n/request.ts references correct messages path", () => {
    const src = readFileSync(resolve(ROOT, "src/i18n/request.ts"), "utf-8");
    assert.ok(src.includes("messages/"), "request.ts should reference messages/ directory");
  });

});
