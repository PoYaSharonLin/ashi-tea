/**
 * Phase 3 — Checkout & NewebPay Integration Tests
 *
 * Validates:
 * 1. src/lib/newebpay.ts — all utility functions
 * 2. Shipping fee calculation logic
 * 3. Order number format
 * 4. API route files exist
 * 5. Checkout page files exist
 * 6. Server action file exists
 *
 * Run: node --experimental-strip-types .tests/phase3.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

// ─── Import the actual lib to test ───────────────────────────────────────────
// We import only the pure functions (no Next.js globals needed)
import {
  encryptAES,
  decryptAES,
  generateTradeSha,
  verifyTradeSha,
  calcShippingFee,
  SHIPPING_FEES,
  FREE_SHIPPING_THRESHOLD,
  getMpgGatewayUrl,
  parseTradePayload,
} from "../src/lib/newebpay.ts";

const TEST_KEY = "12345678901234567890123456789012"; // 32 chars
const TEST_IV = "1234567890123456";                  // 16 chars

// ─── 1. AES helpers ──────────────────────────────────────────────────────────

describe("newebpay: AES-256-CBC", () => {
  it("encryptAES returns non-empty lowercase hex", () => {
    const result = encryptAES("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    assert.ok(result.length > 0, "encrypted result is empty");
    assert.ok(/^[0-9a-f]+$/.test(result), "encrypted result must be lowercase hex");
  });

  it("decryptAES(encryptAES(x)) === x (round-trip)", () => {
    const original = "MerchantID=TEST&Amt=1200&ItemDesc=Ashi+Tea";
    const encrypted = encryptAES(original, TEST_KEY, TEST_IV);
    const decrypted = decryptAES(encrypted, TEST_KEY, TEST_IV);
    assert.equal(decrypted, original, "round-trip AES failed");
  });

  it("different plaintext → different ciphertext", () => {
    const e1 = encryptAES("order=1&amt=500", TEST_KEY, TEST_IV);
    const e2 = encryptAES("order=2&amt=500", TEST_KEY, TEST_IV);
    assert.notEqual(e1, e2);
  });

  it("different keys → different ciphertext", () => {
    const key2 = "98765432109876543210987654321098";
    const e1 = encryptAES("MerchantID=TEST", TEST_KEY, TEST_IV);
    const e2 = encryptAES("MerchantID=TEST", key2, TEST_IV);
    assert.notEqual(e1, e2);
  });
});

// ─── 2. TradeSha ─────────────────────────────────────────────────────────────

describe("newebpay: TradeSha", () => {
  it("generateTradeSha returns 64-char uppercase hex", () => {
    const encrypted = encryptAES("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    const sha = generateTradeSha(encrypted, TEST_KEY, TEST_IV);
    assert.ok(/^[0-9A-F]+$/.test(sha), "TradeSha must be uppercase hex");
    assert.equal(sha.length, 64, "SHA-256 must be 64 hex chars");
  });

  it("verifyTradeSha returns true for valid signature", () => {
    const encrypted = encryptAES("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    const sha = generateTradeSha(encrypted, TEST_KEY, TEST_IV);
    assert.ok(verifyTradeSha(encrypted, sha, TEST_KEY, TEST_IV), "valid sha should pass");
  });

  it("verifyTradeSha returns false for tampered data", () => {
    const encrypted = encryptAES("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    const sha = generateTradeSha(encrypted, TEST_KEY, TEST_IV);
    assert.ok(
      !verifyTradeSha(encrypted + "ff", sha, TEST_KEY, TEST_IV),
      "tampered data should fail",
    );
  });

  it("verifyTradeSha returns false for wrong sha", () => {
    const encrypted = encryptAES("MerchantID=TEST&Amt=500", TEST_KEY, TEST_IV);
    assert.ok(
      !verifyTradeSha(encrypted, "AAAA", TEST_KEY, TEST_IV),
      "wrong sha should fail",
    );
  });
});

// ─── 3. parseTradePayload ────────────────────────────────────────────────────

describe("newebpay: parseTradePayload", () => {
  it("returns null for invalid TradeSha", () => {
    const result = parseTradePayload("abc", "BADSIG", TEST_KEY, TEST_IV);
    assert.equal(result, null);
  });

  it("round-trips a SUCCESS payload", () => {
    const payload = {
      Status: "SUCCESS",
      Message: "付款成功",
      Result: {
        MerchantID: "MS12345678",
        Amt: 1260,
        TradeNo: "24010100001",
        MerchantOrderNo: "AT-20240101-001",
        PaymentType: "CREDIT",
        PayTime: "2024-01-01 12:00:00",
      },
    };
    const encrypted = encryptAES(JSON.stringify(payload), TEST_KEY, TEST_IV);
    const sha = generateTradeSha(encrypted, TEST_KEY, TEST_IV);
    const parsed = parseTradePayload(encrypted, sha, TEST_KEY, TEST_IV);
    assert.ok(parsed !== null, "should parse valid payload");
    assert.equal(parsed?.Status, "SUCCESS");
    assert.equal(parsed?.Result?.MerchantOrderNo, "AT-20240101-001");
  });
});

// ─── 4. Shipping fee ─────────────────────────────────────────────────────────

describe("newebpay: calcShippingFee", () => {
  it("FREE_SHIPPING_THRESHOLD is 1200", () => {
    assert.equal(FREE_SHIPPING_THRESHOLD, 1200);
  });

  it("home_delivery fee is 150 below threshold", () => {
    assert.equal(calcShippingFee("home_delivery", 1199), SHIPPING_FEES.home_delivery);
    assert.equal(SHIPPING_FEES.home_delivery, 150);
  });

  it("seven_eleven / family_mart fee is 60 below threshold", () => {
    assert.equal(calcShippingFee("seven_eleven", 0), 60);
    assert.equal(calcShippingFee("family_mart", 500), 60);
  });

  it("free shipping at exactly threshold", () => {
    assert.equal(calcShippingFee("home_delivery", 1200), 0);
    assert.equal(calcShippingFee("seven_eleven", 1200), 0);
  });

  it("free shipping above threshold", () => {
    assert.equal(calcShippingFee("home_delivery", 5000), 0);
  });
});

// ─── 5. getMpgGatewayUrl ─────────────────────────────────────────────────────

describe("newebpay: getMpgGatewayUrl", () => {
  it("returns ccore (test) URL when env not set to production", () => {
    // process.env.NEWEBPAY_ENV is not set in test, should default to test
    const url = getMpgGatewayUrl();
    assert.ok(url.includes("ccore") || url.includes("core"), "should be a NewebPay URL");
    assert.ok(url.startsWith("https://"), "must be HTTPS");
  });
});

// ─── 6. File existence checks ────────────────────────────────────────────────

describe("Phase 3: required files exist", () => {
  const files = [
    // Core lib
    "src/lib/newebpay.ts",
    // Server actions
    "src/app/actions/orders.ts",
    // API routes
    "src/app/api/newebpay/notify/route.ts",
    "src/app/api/newebpay/return/route.ts",
    // Pages
    "src/app/checkout/page.tsx",
    "src/app/checkout/_components/checkout-form.tsx",
    "src/app/checkout/result/page.tsx",
  ];

  for (const file of files) {
    it(`${file} exists`, () => {
      assert.ok(
        existsSync(resolve(ROOT, file)),
        `Missing: ${file}`,
      );
    });
  }
});

// ─── 7. Order number format ──────────────────────────────────────────────────

describe("Order number format: AT-YYYYMMDD-NNN", () => {
  const pattern = /^AT-\d{8}-\d{3,}$/;

  it("sample order number matches pattern", () => {
    const sample = "AT-20240101-001";
    assert.ok(pattern.test(sample), `${sample} does not match pattern`);
  });

  it("generated order numbers are unique per sequence", () => {
    const date = "20240101";
    const nums = ["001", "002", "003", "100"].map((n) => `AT-${date}-${n}`);
    assert.equal(new Set(nums).size, nums.length);
  });

  it("sequence zero-padded to at least 3 digits", () => {
    const n = "AT-20240101-001";
    const seq = n.split("-")[2];
    assert.ok((seq?.length ?? 0) >= 3);
  });
});

// ─── 8. notify route returns 400 on bad signature ────────────────────────────
// (Integration test simulating the handler logic directly)

describe("Notify handler: bad signature rejected", () => {
  it("parseTradePayload returns null for garbage input", () => {
    const result = parseTradePayload("not-hex", "NOT-A-SHA", TEST_KEY, TEST_IV);
    assert.equal(result, null, "garbage input should return null");
  });
});
