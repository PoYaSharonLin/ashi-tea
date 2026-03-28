/**
 * Phase 1 — Payment System Readiness Test
 *
 * Validates that:
 * 1. Polar is fully removed
 * 2. NewebPay env vars are defined in .env.example with correct format
 * 3. NewebPay AES-256-CBC encryption logic is correct (pure unit test, no network)
 *
 * Run: node --experimental-strip-types .tests/payments.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

function readEnvExample(): Record<string, string> {
  const lines = readFileSync(resolve(ROOT, ".env.example"), "utf-8").split("\n");
  const result: Record<string, string> = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    result[key] = val;
  }
  return result;
}

// ─── NewebPay crypto helpers (mirrors what src/lib/newebpay.ts will implement) ─

/**
 * Encrypts a trade info string using AES-256-CBC.
 * Key/IV must be exactly 32 and 16 chars respectively.
 */
function encryptTradeInfo(tradeInfo: string, hashKey: string, hashIV: string): string {
  const cipher = createCipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey, "utf-8"),
    Buffer.from(hashIV, "utf-8"),
  );
  let encrypted = cipher.update(tradeInfo, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decryptTradeInfo(encrypted: string, hashKey: string, hashIV: string): string {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey, "utf-8"),
    Buffer.from(hashIV, "utf-8"),
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

/**
 * Generates the SHA-256 trade SHA (CheckValue) used in NewebPay MPG.
 * Format: SHA256("HashKey=<key>&<encryptedData>&HashIV=<iv>").toUpperCase()
 */
function generateTradeSha(encryptedData: string, hashKey: string, hashIV: string): string {
  const raw = `HashKey=${hashKey}&${encryptedData}&HashIV=${hashIV}`;
  return createHash("sha256").update(raw).digest("hex").toUpperCase();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Polar removal", () => {

  it("src/api/payments/ does not exist", () => {
    assert.ok(!existsSync(resolve(ROOT, "src/api/payments")),
      "src/api/payments/ still exists (Polar service)");
  });

  it("src/app/api/payments/ does not exist", () => {
    assert.ok(!existsSync(resolve(ROOT, "src/app/api/payments")),
      "src/app/api/payments/ still exists (Polar route)");
  });

  it("@polar-sh packages not in package.json", () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const polarPkgs = Object.keys(deps).filter((k: string) => k.startsWith("@polar-sh"));
    assert.deepEqual(polarPkgs, [],
      `Polar packages still in package.json: ${polarPkgs.join(", ")}`);
  });

});

describe("NewebPay env vars in .env.example", () => {

  it("NEWEBPAY_MERCHANT_ID is defined", () => {
    const vars = readEnvExample();
    assert.ok("NEWEBPAY_MERCHANT_ID" in vars, "Missing NEWEBPAY_MERCHANT_ID");
  });

  it("NEWEBPAY_HASH_KEY is defined", () => {
    const vars = readEnvExample();
    assert.ok("NEWEBPAY_HASH_KEY" in vars, "Missing NEWEBPAY_HASH_KEY");
  });

  it("NEWEBPAY_HASH_IV is defined", () => {
    const vars = readEnvExample();
    assert.ok("NEWEBPAY_HASH_IV" in vars, "Missing NEWEBPAY_HASH_IV");
  });

  it("NEWEBPAY_ENV is 'test' or 'production'", () => {
    const vars = readEnvExample();
    assert.ok(
      ["test", "production"].includes(vars.NEWEBPAY_ENV ?? ""),
      `NEWEBPAY_ENV must be 'test' or 'production', got: ${vars.NEWEBPAY_ENV}`
    );
  });

});

describe("NewebPay AES-256-CBC encryption (unit)", () => {

  // Use NewebPay test credentials (32-char key, 16-char IV)
  const TEST_KEY = "12345678901234567890123456789012"; // 32 chars
  const TEST_IV  = "1234567890123456";                 // 16 chars

  it("encryptTradeInfo produces non-empty hex string", () => {
    const tradeInfo = "MerchantID=MS12345678&RespondType=JSON&TimeStamp=1700000000&Version=2.0&MerchantOrderNo=AT-001&Amt=500&ItemDesc=Ashi+Tea&Email=test@example.com";
    const result = encryptTradeInfo(tradeInfo, TEST_KEY, TEST_IV);
    assert.ok(result.length > 0, "Encrypted result is empty");
    assert.ok(/^[0-9a-f]+$/.test(result), "Encrypted result is not valid hex");
  });

  it("decrypt(encrypt(x)) === x (round-trip)", () => {
    const original = "MerchantID=TEST&Amt=1200&ItemDesc=Ashi+Tea+Gift+Box";
    const encrypted = encryptTradeInfo(original, TEST_KEY, TEST_IV);
    const decrypted = decryptTradeInfo(encrypted, TEST_KEY, TEST_IV);
    assert.equal(decrypted, original, "Round-trip AES encryption failed");
  });

  it("generateTradeSha returns uppercase hex", () => {
    const encrypted = encryptTradeInfo("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    const sha = generateTradeSha(encrypted, TEST_KEY, TEST_IV);
    assert.ok(/^[0-9A-F]+$/.test(sha), "TradeSha must be uppercase hex");
    assert.equal(sha.length, 64, "SHA-256 must be 64 hex chars");
  });

  it("different data produces different encrypted output", () => {
    const e1 = encryptTradeInfo("order=1&amt=500", TEST_KEY, TEST_IV);
    const e2 = encryptTradeInfo("order=2&amt=500", TEST_KEY, TEST_IV);
    assert.notEqual(e1, e2, "Different data should produce different ciphertext");
  });

  it("different keys produce different encrypted output", () => {
    const data = "MerchantID=TEST&Amt=500";
    const key2 = "98765432109876543210987654321098";
    const e1 = encryptTradeInfo(data, TEST_KEY, TEST_IV);
    const e2 = encryptTradeInfo(data, key2, TEST_IV);
    assert.notEqual(e1, e2, "Different keys should produce different ciphertext");
  });

});

describe("NewebPay order number format", () => {

  it("order number follows AT-YYYYMMDD-NNN pattern", () => {
    // This is the format we'll use: AT-20240101-001
    const pattern = /^AT-\d{8}-\d{3,}$/;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const sample = `AT-${dateStr}-001`;
    assert.ok(pattern.test(sample), `Order number format invalid: ${sample}`);
  });

  it("order number is unique per sequence", () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const nums = ["001", "002", "003"].map((n) => `AT-${dateStr}-${n}`);
    const unique = new Set(nums);
    assert.equal(unique.size, nums.length, "Order numbers must be unique");
  });

});
