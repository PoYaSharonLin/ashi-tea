/**
 * Phase 1 — Environment Variables Test
 *
 * Verifies .env.example is up-to-date and that a local .env.local
 * (or process.env) satisfies all required keys.
 *
 * Run:  node --experimental-strip-types .tests/env.test.ts
 *   or: bun test ./.tests/env.test.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const lines = readFileSync(filePath, "utf-8").split("\n");
  const result: Record<string, string> = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

const exampleVars = parseEnvFile(resolve(ROOT, ".env.example"));
// merge .env.local over process.env for local runs
const localVars = parseEnvFile(resolve(ROOT, ".env.local"));
const env = { ...process.env, ...localVars };

// ─── tests ────────────────────────────────────────────────────────────────────

describe("env.example — key inventory", () => {

  it(".env.example must exist", () => {
    assert.ok(existsSync(resolve(ROOT, ".env.example")),
      ".env.example not found at project root");
  });

  it(".env.example must define required keys", () => {
    const required = [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_SERVER_APP_URL",
      "DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "AUTH_SECRET",
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
      "NEWEBPAY_ENV",
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
      "NEXT_PUBLIC_META_PIXEL_ID",
    ];
    const missing = required.filter((k) => !(k in exampleVars));
    assert.deepEqual(missing, [],
      `Missing keys in .env.example: ${missing.join(", ")}`);
  });

  it(".env.example must NOT contain legacy Polar keys", () => {
    const polarKeys = [
      "POLAR_ACCESS_TOKEN",
      "POLAR_WEBHOOK_SECRET",
      "POLAR_ENVIRONMENT",
    ];
    const found = polarKeys.filter((k) => k in exampleVars);
    assert.deepEqual(found, [],
      `Polar keys still present in .env.example: ${found.join(", ")}`);
  });

  it(".env.example must NOT contain GitHub auth keys", () => {
    const githubKeys = ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"];
    const found = githubKeys.filter((k) => k in exampleVars);
    assert.deepEqual(found, [],
      `GitHub auth keys still present in .env.example: ${found.join(", ")}`);
  });

});

describe("env.example — value format sanity", () => {

  it("DATABASE_URL placeholder starts with postgresql://", () => {
    assert.ok(exampleVars.DATABASE_URL?.startsWith("postgresql://"),
      `DATABASE_URL placeholder should start with postgresql://`);
  });

  it("NEXT_PUBLIC_SUPABASE_URL placeholder starts with https://", () => {
    assert.ok(exampleVars.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://"),
      "NEXT_PUBLIC_SUPABASE_URL must be an https:// URL");
  });

  it("NEWEBPAY_ENV placeholder is 'test' or 'production'", () => {
    assert.ok(
      ["test", "production"].includes(exampleVars.NEWEBPAY_ENV ?? ""),
      `NEWEBPAY_ENV must be 'test' or 'production', got: ${exampleVars.NEWEBPAY_ENV}`
    );
  });

  it("RESEND_FROM_EMAIL placeholder contains '@'", () => {
    assert.ok(exampleVars.RESEND_FROM_EMAIL?.includes("@"),
      "RESEND_FROM_EMAIL must be a valid email address");
  });

});

describe(".env.local — runtime values (skipped in CI if absent)", () => {

  const hasLocal = existsSync(resolve(ROOT, ".env.local"));
  const skip = (label: string, fn: () => void) => {
    it(label, () => {
      if (!hasLocal) {
        console.log(`  ⏭ SKIP — .env.local not found (CI mode)`);
        return;
      }
      fn();
    });
  };

  skip("DATABASE_URL must differ from .env.example placeholder", () => {
    const placeholder = exampleVars.DATABASE_URL ?? "";
    assert.ok(
      env.DATABASE_URL && env.DATABASE_URL !== placeholder,
      "DATABASE_URL still matches the .env.example placeholder — fill in your Supabase connection string"
    );
    assert.ok(
      env.DATABASE_URL.startsWith("postgresql://"),
      "DATABASE_URL must start with postgresql://"
    );
  });

  skip("AUTH_SECRET must be at least 32 chars", () => {
    assert.ok(
      (env.AUTH_SECRET?.length ?? 0) >= 32,
      `AUTH_SECRET too short (${env.AUTH_SECRET?.length ?? 0} chars), should be ≥32`
    );
  });

  skip("AUTH_GOOGLE_ID must end with .apps.googleusercontent.com", () => {
    assert.ok(
      env.AUTH_GOOGLE_ID?.endsWith(".apps.googleusercontent.com"),
      "AUTH_GOOGLE_ID should end with .apps.googleusercontent.com"
    );
  });

  skip("RESEND_API_KEY must start with re_", () => {
    assert.ok(
      env.RESEND_API_KEY?.startsWith("re_"),
      "RESEND_API_KEY should start with 're_'"
    );
  });

  skip("NEXT_PUBLIC_SUPABASE_URL must include .supabase.co", () => {
    assert.ok(
      env.NEXT_PUBLIC_SUPABASE_URL?.includes(".supabase.co"),
      "NEXT_PUBLIC_SUPABASE_URL must point to supabase.co"
    );
  });

});
