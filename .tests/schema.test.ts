/**
 * Phase 1 — Database Schema Structure Test
 *
 * Validates that all Phase 1 schema tables are correctly defined,
 * required columns exist, and no stale Polar tables remain.
 *
 * Run: node --experimental-strip-types .tests/schema.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

// ─── helpers ──────────────────────────────────────────────────────────────────

function readSchema(rel: string): string {
  const full = resolve(ROOT, "src/db/schema", rel);
  assert.ok(existsSync(full), `Schema file missing: src/db/schema/${rel}`);
  return readFileSync(full, "utf-8");
}

function assertHasColumn(src: string, column: string, file: string) {
  assert.ok(
    src.includes(`"${column}"`),
    `Column "${column}" not found in ${file}`
  );
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("schema/index.ts — exports", () => {

  it("exports products schema", () => {
    const idx = readSchema("index.ts");
    assert.ok(idx.includes("./products/tables"), "Missing products tables export");
    assert.ok(idx.includes("./products/relations"), "Missing products relations export");
    assert.ok(idx.includes("./products/types"), "Missing products types export");
  });

  it("exports orders schema", () => {
    const idx = readSchema("index.ts");
    assert.ok(idx.includes("./orders/tables"), "Missing orders tables export");
    assert.ok(idx.includes("./orders/relations"), "Missing orders relations export");
    assert.ok(idx.includes("./orders/types"), "Missing orders types export");
  });

  it("exports cart schema", () => {
    const idx = readSchema("index.ts");
    assert.ok(idx.includes("./cart/tables"), "Missing cart tables export");
    assert.ok(idx.includes("./cart/relations"), "Missing cart relations export");
    assert.ok(idx.includes("./cart/types"), "Missing cart types export");
  });

  it("exports users schema", () => {
    const idx = readSchema("index.ts");
    assert.ok(idx.includes("./users/tables"), "Missing users tables export");
  });

  it("does NOT export Polar payments schema", () => {
    const idx = readSchema("index.ts");
    assert.ok(!idx.includes("./payments/"), "Polar payments schema still exported in index.ts");
  });

});

describe("schema/products/tables.ts", () => {

  it("file exists", () => {
    readSchema("products/tables.ts"); // throws if missing
  });

  it("defines productTable", () => {
    const src = readSchema("products/tables.ts");
    assert.ok(src.includes("productTable"), "productTable not defined");
  });

  it("defines productVariantTable", () => {
    const src = readSchema("products/tables.ts");
    assert.ok(src.includes("productVariantTable"), "productVariantTable not defined");
  });

  it("productTable has required columns", () => {
    const src = readSchema("products/tables.ts");
    for (const col of ["id", "name", "category", "is_active", "is_featured", "created_at", "updated_at"]) {
      assertHasColumn(src, col, "products/tables.ts");
    }
  });

  it("productTable has i18n columns (nameEn, descriptionEn)", () => {
    const src = readSchema("products/tables.ts");
    assertHasColumn(src, "name_en", "products/tables.ts");
    assertHasColumn(src, "description_en", "products/tables.ts");
  });

  it("productVariantTable has price and stock columns", () => {
    const src = readSchema("products/tables.ts");
    assertHasColumn(src, "price", "products/tables.ts");
    assertHasColumn(src, "stock", "products/tables.ts");
    assertHasColumn(src, "sku", "products/tables.ts");
  });

  it("productCategoryEnum includes expected values", () => {
    const src = readSchema("products/tables.ts");
    for (const val of ["loose_leaf", "gift_box", "tea_bag", "accessory"]) {
      assert.ok(src.includes(`"${val}"`), `Missing category enum value: ${val}`);
    }
  });

});

describe("schema/orders/tables.ts", () => {

  it("defines orderTable and orderItemTable", () => {
    const src = readSchema("orders/tables.ts");
    assert.ok(src.includes("orderTable"), "orderTable not defined");
    assert.ok(src.includes("orderItemTable"), "orderItemTable not defined");
  });

  it("orderTable has logistics columns", () => {
    const src = readSchema("orders/tables.ts");
    for (const col of [
      "shipping_method",
      "shipping_store_name",
      "shipping_store_id",
      "shipping_address",
      "recipient_name",
      "recipient_phone",
    ]) {
      assertHasColumn(src, col, "orders/tables.ts");
    }
  });

  it("orderTable has payment columns for NewebPay", () => {
    const src = readSchema("orders/tables.ts");
    assertHasColumn(src, "newebpay_trade_no", "orders/tables.ts");
    assertHasColumn(src, "newebpay_merchant_order_no", "orders/tables.ts");
    assertHasColumn(src, "payment_method", "orders/tables.ts");
  });

  it("orderStatusEnum includes all expected states", () => {
    const src = readSchema("orders/tables.ts");
    for (const val of ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]) {
      assert.ok(src.includes(`"${val}"`), `Missing order status: ${val}`);
    }
  });

  it("shippingMethodEnum includes Taiwan logistics options", () => {
    const src = readSchema("orders/tables.ts");
    for (const val of ["seven_eleven", "family_mart", "home_delivery"]) {
      assert.ok(src.includes(`"${val}"`), `Missing shipping method: ${val}`);
    }
  });

  it("orderItemTable has snapshot columns (productName, unitPrice)", () => {
    const src = readSchema("orders/tables.ts");
    assertHasColumn(src, "product_name", "orders/tables.ts");
    assertHasColumn(src, "unit_price", "orders/tables.ts");
    assertHasColumn(src, "quantity", "orders/tables.ts");
  });

});

describe("schema/cart/tables.ts", () => {

  it("defines cartItemTable", () => {
    const src = readSchema("cart/tables.ts");
    assert.ok(src.includes("cartItemTable"), "cartItemTable not defined");
  });

  it("has unique constraint on userId + variantId", () => {
    const src = readSchema("cart/tables.ts");
    assert.ok(
      src.includes("unique") && src.includes("userId") && src.includes("variantId"),
      "Missing unique constraint on (userId, variantId)"
    );
  });

});

describe("schema/users/tables.ts", () => {

  it("userTable has phone column", () => {
    const src = readSchema("users/tables.ts");
    assertHasColumn(src, "phone", "users/tables.ts");
  });

  it("userTable does NOT reference Polar tables", () => {
    const src = readSchema("users/tables.ts");
    assert.ok(!src.includes("polar"), "users/tables.ts should not reference Polar");
  });

});

describe("Polar schema files — must not exist", () => {

  it("src/db/schema/payments/ directory is removed", () => {
    assert.ok(
      !existsSync(resolve(ROOT, "src/db/schema/payments")),
      "src/db/schema/payments/ still exists — Polar schema was not removed"
    );
  });

  it("src/api/payments/ directory is removed", () => {
    assert.ok(
      !existsSync(resolve(ROOT, "src/api/payments")),
      "src/api/payments/ still exists"
    );
  });

  it("src/ui/components/payments/ directory is removed", () => {
    assert.ok(
      !existsSync(resolve(ROOT, "src/ui/components/payments")),
      "src/ui/components/payments/ still exists"
    );
  });

});
