/**
 * P0 電商規範測試
 *
 * 驗證：
 * 1. sitemap.ts 存在且包含必要路由
 * 2. robots.ts 存在且格式正確
 * 3. generateMetadata 加入商品詳情頁
 * 4. layout.tsx 使用動態 lang（getLocale）
 * 5. not-found.tsx 存在（品牌化 404）
 * 6. error.tsx 存在（品牌化錯誤頁，Client Component）
 * 7. orders.ts 有庫存扣減邏輯（insufficient_stock 保護）
 * 8. product-card.tsx 使用 i18n labels prop
 * 9. products/page.tsx 傳遞 labels 給 ProductCard
 * 10. i18n errors 新 key（notFoundDescription、goHome）在兩個 locale 都存在
 *
 * Run: node --experimental-strip-types .tests/p0.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

function readFile(rel: string): string {
  const full = resolve(ROOT, rel);
  assert.ok(existsSync(full), `File missing: ${rel}`);
  return readFileSync(full, "utf-8");
}

function loadJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf-8")) as Record<string, unknown>;
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

// ─── sitemap ──────────────────────────────────────────────────────────────────

describe("sitemap.ts", () => {
  it("src/app/sitemap.ts exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/app/sitemap.ts")));
  });

  it("exports a default async function", () => {
    const src = readFile("src/app/sitemap.ts");
    assert.ok(src.includes("export default async function sitemap"), "sitemap should export default async function");
  });

  it("imports MetadataRoute from next", () => {
    const src = readFile("src/app/sitemap.ts");
    assert.ok(src.includes("MetadataRoute"), "sitemap should import MetadataRoute");
  });

  it("includes static routes (home, products, terms, privacy)", () => {
    const src = readFile("src/app/sitemap.ts");
    assert.ok(src.includes('"/products"'), 'should include /products route');
    assert.ok(src.includes('"/terms"'), 'should include /terms route');
    assert.ok(src.includes('"/privacy"'), 'should include /privacy route');
  });

  it("generates both zh-TW and en URLs", () => {
    const src = readFile("src/app/sitemap.ts");
    assert.ok(src.includes('"/en"') || src.includes('`${BASE_URL}/en`') || src.includes("/en"), "should generate /en locale URLs");
  });

  it("fetches products from DB", () => {
    const src = readFile("src/app/sitemap.ts");
    assert.ok(src.includes("productTable"), "should query products from DB");
  });
});

// ─── robots ───────────────────────────────────────────────────────────────────

describe("robots.ts", () => {
  it("src/app/robots.ts exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/app/robots.ts")));
  });

  it("exports a default function", () => {
    const src = readFile("src/app/robots.ts");
    assert.ok(src.includes("export default function robots"), "robots should export default function");
  });

  it("references sitemap URL", () => {
    const src = readFile("src/app/robots.ts");
    assert.ok(src.includes("sitemap"), "robots should reference sitemap URL");
  });
});

// ─── generateMetadata ─────────────────────────────────────────────────────────

describe("products/[id] generateMetadata", () => {
  it("exports generateMetadata", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("export async function generateMetadata"), "should export generateMetadata");
  });

  it("returns product name in title", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("product.name"), "title should include product.name");
  });

  it("returns product description", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("product.description"), "description should use product.description");
  });

  it("imports Metadata type from next", () => {
    const src = readFile("src/app/products/[id]/page.tsx");
    assert.ok(src.includes("import type { Metadata }"), "should import Metadata type");
  });
});

// ─── layout.tsx html lang ─────────────────────────────────────────────────────

describe("layout.tsx dynamic lang", () => {
  it("imports getLocale from next-intl/server", () => {
    const src = readFile("src/app/layout.tsx");
    assert.ok(src.includes("getLocale") && src.includes("next-intl/server"), "should import getLocale from next-intl/server");
  });

  it("RootLayout is async", () => {
    const src = readFile("src/app/layout.tsx");
    assert.ok(src.includes("async function RootLayout"), "RootLayout should be async");
  });

  it("uses locale variable for html lang", () => {
    const src = readFile("src/app/layout.tsx");
    assert.ok(src.includes("lang={locale}"), "html lang should be dynamic {locale}");
  });

  it("no longer hardcodes lang='en'", () => {
    const src = readFile("src/app/layout.tsx");
    assert.ok(!src.includes('lang="en"'), 'html lang should not be hardcoded "en"');
  });
});

// ─── not-found.tsx ────────────────────────────────────────────────────────────

describe("not-found.tsx", () => {
  it("src/app/not-found.tsx exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/app/not-found.tsx")));
  });

  it("is NOT a client component (Server Component)", () => {
    const src = readFile("src/app/not-found.tsx");
    assert.ok(!src.startsWith('"use client"'), "not-found.tsx should be a Server Component");
  });

  it("uses getTranslations from next-intl", () => {
    const src = readFile("src/app/not-found.tsx");
    assert.ok(src.includes("getTranslations"), "not-found.tsx should use getTranslations");
  });

  it("has a link back to home", () => {
    const src = readFile("src/app/not-found.tsx");
    assert.ok(src.includes('href="/"'), "not-found.tsx should have a link to /");
  });
});

// ─── error.tsx ────────────────────────────────────────────────────────────────

describe("error.tsx", () => {
  it("src/app/error.tsx exists", () => {
    assert.ok(existsSync(resolve(ROOT, "src/app/error.tsx")));
  });

  it("is a client component", () => {
    const src = readFile("src/app/error.tsx");
    assert.ok(src.includes('"use client"'), "error.tsx must be a Client Component");
  });

  it("accepts reset prop and wires it to a button", () => {
    const src = readFile("src/app/error.tsx");
    assert.ok(src.includes("reset"), "error.tsx should accept reset prop");
    assert.ok(src.includes("onClick") && (src.includes("reset") ), "error.tsx should wire reset to onClick");
  });

  it("has a link back to home", () => {
    const src = readFile("src/app/error.tsx");
    assert.ok(src.includes('href="/"'), "error.tsx should have a link to /");
  });
});

// ─── orders.ts inventory deduction ───────────────────────────────────────────

describe("orders.ts — inventory deduction", () => {
  it("deducts stock atomically in transaction", () => {
    const src = readFile("src/app/actions/orders.ts");
    assert.ok(src.includes("stock") && src.includes("productVariantTable"), "should update stock on productVariantTable");
  });

  it("uses gte check to prevent overselling", () => {
    const src = readFile("src/app/actions/orders.ts");
    assert.ok(src.includes("gte(productVariantTable.stock"), "should use gte(stock, quantity) to prevent overselling");
  });

  it("returns insufficient_stock error when out of stock", () => {
    const src = readFile("src/app/actions/orders.ts");
    assert.ok(src.includes("insufficient_stock"), "should return insufficient_stock error");
  });

  it("uses .returning() to detect failed update", () => {
    const src = readFile("src/app/actions/orders.ts");
    assert.ok(src.includes(".returning("), "should use .returning() to check if update succeeded");
  });
});

// ─── product-card.tsx i18n ────────────────────────────────────────────────────

describe("product-card.tsx — i18n labels", () => {
  it("accepts labels prop", () => {
    const src = readFile("src/ui/components/product-card.tsx");
    assert.ok(src.includes("labels"), "ProductCard should accept labels prop");
  });

  it("button text uses addToCartLabel variable, not raw string", () => {
    const src = readFile("src/ui/components/product-card.tsx");
    // The JSX must render {addToCartLabel}, not a raw "Add to Cart" string
    assert.ok(src.includes("{addToCartLabel}"), "button should render {addToCartLabel}");
  });

  it("badge text uses outOfStockLabel variable, not raw string", () => {
    const src = readFile("src/ui/components/product-card.tsx");
    assert.ok(src.includes("{outOfStockLabel}"), "badge should render {outOfStockLabel}");
  });

  it("uses addToCartLabel variable", () => {
    const src = readFile("src/ui/components/product-card.tsx");
    assert.ok(src.includes("addToCartLabel"), "should use addToCartLabel variable");
  });
});

// ─── products/page.tsx passes labels ─────────────────────────────────────────

describe("products/page.tsx — passes labels to ProductCard", () => {
  it("passes addToCart label from getTranslations", () => {
    const src = readFile("src/app/products/page.tsx");
    assert.ok(src.includes('t("addToCart")') || src.includes("t('addToCart')"),
      "should pass addToCart translation to ProductCard");
  });

  it("passes outOfStock label from getTranslations", () => {
    const src = readFile("src/app/products/page.tsx");
    assert.ok(src.includes("outOfStock"), "should pass outOfStock label to ProductCard");
  });
});

// ─── i18n errors namespace new keys ──────────────────────────────────────────

describe("i18n — errors namespace new keys", () => {
  for (const locale of ["zh-TW", "en"]) {
    it(`${locale}.json has errors.notFoundDescription`, () => {
      const msg = loadJson(`messages/${locale}.json`);
      const val = getNestedValue(msg, "errors.notFoundDescription");
      assert.ok(typeof val === "string" && val.length > 0,
        `${locale}.json should have non-empty errors.notFoundDescription`);
    });

    it(`${locale}.json has errors.goHome`, () => {
      const msg = loadJson(`messages/${locale}.json`);
      const val = getNestedValue(msg, "errors.goHome");
      assert.ok(typeof val === "string" && val.length > 0,
        `${locale}.json should have non-empty errors.goHome`);
    });
  }
});
