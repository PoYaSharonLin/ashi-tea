/**
 * Phase 1 — i18n Structure Test
 *
 * Validates that:
 * 1. routing.ts has correct locale / defaultLocale config
 * 2. Both message files exist
 * 3. zh-TW and en have the same top-level keys (no missing translations)
 * 4. Every key referenced in zh-TW has a non-empty string value in both files
 *
 * Run: node --experimental-strip-types .tests/i18n.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

// ─── helpers ──────────────────────────────────────────────────────────────────

function loadJson(rel: string): Record<string, unknown> {
  const full = resolve(ROOT, rel);
  assert.ok(existsSync(full), `File missing: ${rel}`);
  return JSON.parse(readFileSync(full, "utf-8")) as Record<string, unknown>;
}

/** Recursively collect all dot-notation leaf keys from a nested object */
function leafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...leafKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("i18n routing config", () => {

  it("src/i18n/routing.ts exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/i18n/routing.ts")),
      "src/i18n/routing.ts not found");
  });

  it("src/i18n/request.ts exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/i18n/request.ts")),
      "src/i18n/request.ts not found");
  });

  it("middleware.ts exists at project root", () => {
    assert.ok(existsSync(resolve(ROOT, "middleware.ts")),
      "middleware.ts not found at project root");
  });

  it("routing.ts declares zh-TW and en locales", () => {
    const src = readFileSync(resolve(ROOT, "src/i18n/routing.ts"), "utf-8");
    assert.ok(src.includes('"zh-TW"'), 'routing.ts missing "zh-TW" locale');
    assert.ok(src.includes('"en"'), 'routing.ts missing "en" locale');
  });

  it("routing.ts sets zh-TW as defaultLocale", () => {
    const src = readFileSync(resolve(ROOT, "src/i18n/routing.ts"), "utf-8");
    assert.ok(src.includes('defaultLocale: "zh-TW"'),
      'defaultLocale should be "zh-TW"');
  });

  it("routing.ts uses localePrefix as-needed", () => {
    const src = readFileSync(resolve(ROOT, "src/i18n/routing.ts"), "utf-8");
    assert.ok(src.includes('"as-needed"'),
      'localePrefix should be "as-needed" so zh-TW has no /zh-TW prefix');
  });

  it("middleware.ts imports from next-intl/middleware", () => {
    const src = readFileSync(resolve(ROOT, "middleware.ts"), "utf-8");
    assert.ok(src.includes("next-intl/middleware"),
      "middleware.ts should import from next-intl/middleware");
  });

  it("next.config.ts uses next-intl plugin", () => {
    const src = readFileSync(resolve(ROOT, "next.config.ts"), "utf-8");
    assert.ok(src.includes("next-intl/plugin") || src.includes("createNextIntlPlugin"),
      "next.config.ts should use the next-intl plugin");
  });

});

describe("messages/zh-TW.json", () => {

  it("file exists", () => {
    assert.ok(existsSync(resolve(ROOT, "messages/zh-TW.json")));
  });

  it("is valid JSON", () => {
    loadJson("messages/zh-TW.json"); // throws on invalid JSON
  });

  it("has all required top-level namespaces", () => {
    const msg = loadJson("messages/zh-TW.json");
    const required = ["common", "nav", "home", "products", "cart",
                      "checkout", "orderConfirmation", "account",
                      "orderStatus", "auth", "footer", "errors"];
    const missing = required.filter((k) => !(k in msg));
    assert.deepEqual(missing, [],
      `zh-TW.json missing top-level namespaces: ${missing.join(", ")}`);
  });

  it("nav has all required keys", () => {
    const msg = loadJson("messages/zh-TW.json");
    const nav = (msg.nav ?? {}) as Record<string, unknown>;
    for (const k of ["home", "products", "cart", "account", "signIn", "signOut"]) {
      assert.ok(k in nav, `zh-TW nav missing key: ${k}`);
    }
  });

  it("orderStatus covers all DB enum values", () => {
    const msg = loadJson("messages/zh-TW.json");
    const status = (msg.orderStatus ?? {}) as Record<string, unknown>;
    for (const k of ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]) {
      assert.ok(k in status, `zh-TW orderStatus missing: ${k}`);
    }
  });

});

describe("messages/en.json", () => {

  it("file exists", () => {
    assert.ok(existsSync(resolve(ROOT, "messages/en.json")));
  });

  it("is valid JSON", () => {
    loadJson("messages/en.json");
  });

  it("has all required top-level namespaces", () => {
    const msg = loadJson("messages/en.json");
    const required = ["common", "nav", "home", "products", "cart",
                      "checkout", "orderConfirmation", "account",
                      "orderStatus", "auth", "footer", "errors"];
    const missing = required.filter((k) => !(k in msg));
    assert.deepEqual(missing, [],
      `en.json missing top-level namespaces: ${missing.join(", ")}`);
  });

});

describe("messages — key parity (zh-TW vs en)", () => {

  it("en.json has every leaf key that zh-TW.json has", () => {
    const zhTW = loadJson("messages/zh-TW.json");
    const en = loadJson("messages/en.json");

    const zhKeys = leafKeys(zhTW);
    const missing = zhKeys.filter((k) => {
      const val = getNestedValue(en, k);
      return val === undefined;
    });

    assert.deepEqual(missing, [],
      `en.json is missing keys present in zh-TW.json:\n  ${missing.join("\n  ")}`);
  });

  it("zh-TW.json has every leaf key that en.json has", () => {
    const zhTW = loadJson("messages/zh-TW.json");
    const en = loadJson("messages/en.json");

    const enKeys = leafKeys(en);
    const missing = enKeys.filter((k) => {
      const val = getNestedValue(zhTW, k);
      return val === undefined;
    });

    assert.deepEqual(missing, [],
      `zh-TW.json is missing keys present in en.json:\n  ${missing.join("\n  ")}`);
  });

  it("no translation value is an empty string", () => {
    for (const locale of ["zh-TW", "en"]) {
      const msg = loadJson(`messages/${locale}.json`);
      const keys = leafKeys(msg);
      const empty = keys.filter((k) => {
        const v = getNestedValue(msg, k);
        return typeof v === "string" && v.trim() === "";
      });
      assert.deepEqual(empty, [],
        `${locale}.json has empty string values:\n  ${empty.join("\n  ")}`);
    }
  });

});
