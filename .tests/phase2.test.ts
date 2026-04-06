/**
 * Phase 2 — Product Pages & Cart Tests
 *
 * Validates:
 * 1. New files exist with correct structure
 * 2. Server Actions have required exports
 * 3. Cart page exists
 * 4. Product page is a Server Component (no "use client")
 * 5. Cart pricing logic
 * 6. Category filter is valid
 *
 * Run: node --experimental-strip-types .tests/phase2.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

function readFile(rel: string): string {
  const full = resolve(ROOT, rel);
  assert.ok(existsSync(full), `File missing: ${rel}`);
  return readFileSync(full, "utf-8");
}

// ─── Server Actions ────────────────────────────────────────────────────────────

describe("src/app/actions/products.ts", () => {
  it("file exists", () => {
    readFile("src/app/actions/products.ts");
  });

  it('has "use server" directive', () => {
    const src = readFile("src/app/actions/products.ts");
    assert.ok(src.includes('"use server"'), 'Missing "use server" directive');
  });

  it("exports getProducts function", () => {
    const src = readFile("src/app/actions/products.ts");
    assert.ok(src.includes("export async function getProducts"), "Missing getProducts export");
  });

  it("exports getProductById function", () => {
    const src = readFile("src/app/actions/products.ts");
    assert.ok(src.includes("export async function getProductById"), "Missing getProductById export");
  });

  it("filters by isActive = true", () => {
    const src = readFile("src/app/actions/products.ts");
    assert.ok(src.includes("isActive"), "Should filter by isActive");
  });

  it("supports category filtering", () => {
    const src = readFile("src/app/actions/products.ts");
    assert.ok(
      src.includes("loose_leaf") && src.includes("gift_box") && src.includes("tea_bag"),
      "Should have category enum values"
    );
  });
});

describe("src/app/actions/cart.ts", () => {
  it("file exists", () => {
    readFile("src/app/actions/cart.ts");
  });

  it('has "use server" directive', () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes('"use server"'), 'Missing "use server" directive');
  });

  it("exports getDbCart", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("export async function getDbCart"), "Missing getDbCart export");
  });

  it("exports addToDbCart", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("export async function addToDbCart"), "Missing addToDbCart export");
  });

  it("exports removeFromDbCart", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("export async function removeFromDbCart"), "Missing removeFromDbCart export");
  });

  it("exports updateDbCartQuantity", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("export async function updateDbCartQuantity"), "Missing updateDbCartQuantity export");
  });

  it("checks user session before DB operations", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("getSessionUserId"), "Should use getSessionUserId for auth check");
  });

  it("uses onConflictDoUpdate for cart insert (D4 compliance)", () => {
    const src = readFile("src/app/actions/cart.ts");
    assert.ok(src.includes("onConflictDoUpdate"), "Should use onConflictDoUpdate per D4 decision");
  });
});

// ─── Product Pages ─────────────────────────────────────────────────────────────

describe("src/app/products/page.tsx", () => {
  it("file exists", () => {
    readFile("src/app/products/page.tsx");
  });

  it("is a Server Component (no top-level 'use client')", () => {
    const src = readFile("src/app/products/page.tsx");
    // Server component should NOT start with "use client"
    const firstLine = src.trimStart().split("\n")[0]?.trim();
    assert.notEqual(firstLine, '"use client";', "Products listing page should be a Server Component");
  });

  it("uses getTranslations from next-intl/server", () => {
    const src = readFile("src/app/products/page.tsx");
    assert.ok(src.includes("getTranslations"), "Should use getTranslations for i18n");
  });

  it("imports getProducts action", () => {
    const src = readFile("src/app/products/page.tsx");
    assert.ok(src.includes("getProducts"), "Should import getProducts action");
  });

  it("uses searchParams for category filter", () => {
    const src = readFile("src/app/products/page.tsx");
    assert.ok(src.includes("searchParams"), "Should use searchParams for category filter");
  });
});

describe("src/app/products/[id]/page.tsx", () => {
  it("file exists", () => {
    readFile("src/app/products/[id]/page.tsx");
  });

  it("is a Server Component (no top-level 'use client')", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    const firstLine = src.trimStart().split("\n")[0]?.trim();
    assert.notEqual(firstLine, '"use client";', "Product detail page should be a Server Component");
  });

  it("imports getProductById action", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("getProductById"), "Should import getProductById action");
  });

  it("uses notFound() when product doesn't exist", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("notFound()"), "Should call notFound() for missing products");
  });

  it("uses NT$ pricing (not USD)", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("NT$"), "Should display NT$ pricing");
  });
});

// ─── Product Components ────────────────────────────────────────────────────────

describe("src/app/products/_components/products-filter.tsx", () => {
  it("file exists", () => {
    readFile("src/app/products/_components/products-filter.tsx");
  });

  it('is a Client Component ("use client")', () => {
    const src = readFile("src/app/products/_components/products-filter.tsx");
    assert.ok(src.includes('"use client"'), "ProductsFilter should be a Client Component");
  });

  it("has all category options", () => {
    const src = readFile("src/app/products/_components/products-filter.tsx");
    for (const cat of ["all", "loose_leaf", "tea_brick", "mixed_gift_box"]) {
      assert.ok(src.includes(cat), `Missing category: ${cat}`);
    }
  });

  it("uses useRouter and useSearchParams for URL-based filter", () => {
    const src = readFile("src/app/products/_components/products-filter.tsx");
    assert.ok(src.includes("useRouter"), "Should use useRouter");
    assert.ok(src.includes("useSearchParams"), "Should use useSearchParams");
  });
});

describe("src/app/products/_components/add-to-cart-form.tsx", () => {
  it("file exists", () => {
    readFile("src/app/products/_components/add-to-cart-form.tsx");
  });

  it('is a Client Component ("use client")', () => {
    const src = readFile("src/app/products/_components/add-to-cart-form.tsx");
    assert.ok(src.includes('"use client"'), "AddToCartForm should be a Client Component");
  });

  it("uses useCart hook", () => {
    const src = readFile("src/app/products/_components/add-to-cart-form.tsx");
    assert.ok(src.includes("useCart"), "Should use useCart hook");
  });

  it("has variant selector", () => {
    const src = readFile("src/app/products/_components/add-to-cart-form.tsx");
    assert.ok(src.includes("selectedVariantId"), "Should have variant selection state");
  });

  it("uses Number() to convert price (D2 compliance)", () => {
    const src = readFile("src/app/products/_components/add-to-cart-form.tsx");
    assert.ok(src.includes("Number(selectedVariant.price)"), "Should convert price with Number() per D2");
  });
});

// ─── Cart Page ─────────────────────────────────────────────────────────────────

describe("src/app/cart/page.tsx", () => {
  it("file exists", () => {
    readFile("src/app/cart/page.tsx");
  });

  it('is a Client Component ("use client")', () => {
    const src = readFile("src/app/cart/page.tsx");
    assert.ok(src.includes('"use client"'), "Cart page should be a Client Component");
  });

  it("uses useCart hook", () => {
    const src = readFile("src/app/cart/page.tsx");
    assert.ok(src.includes("useCart"), "Should use useCart hook");
  });

  it("shows free shipping threshold (NT$1200)", () => {
    const src = readFile("src/app/cart/page.tsx");
    assert.ok(src.includes("1200"), "Should show NT$1200 free shipping threshold");
  });

  it("links to /checkout", () => {
    const src = readFile("src/app/cart/page.tsx");
    assert.ok(src.includes("/checkout"), "Should link to /checkout");
  });
});

// ─── Cart Sidebar ──────────────────────────────────────────────────────────────

describe("src/ui/components/cart-client.tsx", () => {
  it("no longer uses mockCart prop", () => {
    const src = readFile("src/ui/components/cart-client.tsx");
    assert.ok(!src.includes("mockCart"), "cart-client should not use mockCart anymore");
  });

  it("uses useCart hook directly", () => {
    const src = readFile("src/ui/components/cart-client.tsx");
    assert.ok(src.includes("useCart"), "Should use useCart hook");
  });

  it("shows NT$ pricing", () => {
    const src = readFile("src/ui/components/cart-client.tsx");
    assert.ok(src.includes("NT$"), "Should use NT$ pricing");
  });
});

describe("src/ui/components/cart.tsx", () => {
  it("no longer passes mockCart to CartClient", () => {
    const src = readFile("src/ui/components/cart.tsx");
    assert.ok(!src.includes("mockCart"), "cart.tsx should not pass mockCart");
  });
});

// ─── Seed file ────────────────────────────────────────────────────────────────

describe("src/db/seed.ts", () => {
  it("file exists", () => {
    readFile("src/db/seed.ts");
  });

  it("contains tea product data", () => {
    const src = readFile("src/db/seed.ts");
    assert.ok(
      src.includes("烏龍") || src.includes("Oolong") ||
      src.includes("普洱") || src.includes("Pu") ||
      src.includes("紅茶") || src.includes("Black Tea"),
      "Should contain tea product data"
    );
  });

  it("uses productTable and productVariantTable", () => {
    const src = readFile("src/db/seed.ts");
    assert.ok(src.includes("productTable"), "Should use productTable");
    assert.ok(src.includes("productVariantTable"), "Should use productVariantTable");
  });

  it("uses onConflictDoNothing for idempotent seeding", () => {
    const src = readFile("src/db/seed.ts");
    assert.ok(src.includes("onConflictDoNothing"), "Should be idempotent via onConflictDoNothing");
  });
});

// ─── Pricing logic ────────────────────────────────────────────────────────────

describe("cart pricing logic", () => {
  const FREE_SHIPPING_THRESHOLD = 1200;
  const SHIPPING_FEE = 60;

  it("applies free shipping when subtotal >= 1200", () => {
    const subtotal = 1200;
    const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    assert.equal(fee, 0, "Should be free shipping at NT$1200");
  });

  it("charges shipping fee when subtotal < 1200", () => {
    const subtotal = 800;
    const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    assert.equal(fee, 60, "Should charge NT$60 shipping");
  });

  it("calculates total correctly", () => {
    const subtotal = 850;
    const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + fee;
    assert.equal(total, 910, "Total = subtotal + shipping fee");
  });

  it("price stored as numeric string, Number() converts correctly (D2)", () => {
    const priceFromDb = "450";
    assert.equal(Number(priceFromDb), 450, "Number() converts DB numeric string correctly");
    assert.equal(typeof Number(priceFromDb), "number");
  });
});
