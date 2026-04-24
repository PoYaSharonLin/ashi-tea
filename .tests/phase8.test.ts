/**
 * Phase 8 — Consumer Rights & Legal Pages Tests
 *
 * Validates:
 * 1. Required page files exist (terms, privacy, refund-policy, shipping-info)
 * 2. Shared LegalPage component exists
 * 3. Footer component links to all four policy pages
 * 4. i18n messages include legal namespace with all four sections
 * 5. routing.ts includes routes for all four pages
 * 6. Pages use getTranslations from next-intl
 *
 * Run: node --experimental-strip-types .tests/phase8.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

function readFile(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf-8");
}

function loadJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf-8")) as Record<
    string,
    unknown
  >;
}

// ─── 1. Required page files exist ────────────────────────────────────────────

describe("Phase 8: required files exist", () => {
  const files = [
    "src/app/terms/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/refund-policy/page.tsx",
    "src/app/shipping-info/page.tsx",
    "src/ui/components/legal-page.tsx",
  ];

  for (const file of files) {
    it(`${file} exists`, () => {
      assert.ok(existsSync(resolve(ROOT, file)), `Missing: ${file}`);
    });
  }
});

// ─── 2. Footer links to all policy pages ─────────────────────────────────────

describe("Phase 8: footer contains policy links", () => {
  const footerContent = readFile("src/ui/components/footer.tsx");

  const links = [
    { path: "/terms", label: "terms page" },
    { path: "/privacy", label: "privacy page" },
    { path: "/refund-policy", label: "refund policy page" },
    { path: "/shipping-info", label: "shipping info page" },
  ];

  for (const link of links) {
    it(`footer links to ${link.path}`, () => {
      assert.ok(
        footerContent.includes(link.path),
        `Footer missing link to ${link.path}`,
      );
    });
  }
});

// ─── 3. Footer uses next-intl getTranslations ───────────────────────────────

describe("Phase 8: footer uses i18n", () => {
  it("footer imports getTranslations", () => {
    const content = readFile("src/ui/components/footer.tsx");
    assert.ok(
      content.includes("getTranslations"),
      "Footer should use getTranslations for i18n",
    );
  });
});

// ─── 4. i18n legal namespace exists with all sections ────────────────────────

describe("Phase 8: i18n legal translations", () => {
  const locales = ["zh-TW", "en"];
  const requiredSections = ["terms", "privacy", "refund", "shipping"];

  for (const locale of locales) {
    it(`${locale}.json has legal namespace`, () => {
      const msg = loadJson(`messages/${locale}.json`);
      assert.ok("legal" in msg, `${locale}.json missing "legal" namespace`);
    });

    for (const section of requiredSections) {
      it(`${locale}.json has legal.${section}`, () => {
        const msg = loadJson(`messages/${locale}.json`);
        const legal = msg.legal as Record<string, unknown>;
        assert.ok(
          section in legal,
          `${locale}.json missing legal.${section}`,
        );
      });

      it(`${locale}.json legal.${section} has title, intro, sections`, () => {
        const msg = loadJson(`messages/${locale}.json`);
        const legal = msg.legal as Record<string, Record<string, unknown>>;
        const s = legal[section];
        assert.ok(s, `legal.${section} is missing`);
        assert.ok("title" in s, `legal.${section} missing title`);
        assert.ok("intro" in s, `legal.${section} missing intro`);
        assert.ok("sections" in s, `legal.${section} missing sections`);
      });
    }
  }
});

// ─── 5. routing.ts includes policy routes ────────────────────────────────────

describe("Phase 8: routing includes policy paths", () => {
  const routingContent = readFile("src/i18n/routing.ts");
  const routes = ["/terms", "/privacy", "/refund-policy", "/shipping-info"];

  for (const route of routes) {
    it(`routing.ts includes "${route}"`, () => {
      assert.ok(
        routingContent.includes(`"${route}"`),
        `routing.ts missing route: ${route}`,
      );
    });
  }
});

// ─── 6. Pages use getTranslations ────────────────────────────────────────────

describe("Phase 8: pages use getTranslations", () => {
  const pages = [
    { file: "src/app/terms/page.tsx", ns: "legal.terms" },
    { file: "src/app/privacy/page.tsx", ns: "legal.privacy" },
    { file: "src/app/refund-policy/page.tsx", ns: "legal.refund" },
    { file: "src/app/shipping-info/page.tsx", ns: "legal.shipping" },
  ];

  for (const page of pages) {
    it(`${page.file} uses getTranslations("${page.ns}")`, () => {
      const content = readFile(page.file);
      assert.ok(
        content.includes("getTranslations"),
        `${page.file} should import getTranslations`,
      );
      assert.ok(
        content.includes(page.ns),
        `${page.file} should use namespace "${page.ns}"`,
      );
    });
  }
});

// ─── 7. LegalPage component has required props ──────────────────────────────

describe("Phase 8: LegalPage component", () => {
  it("accepts title, lastUpdated, intro, sections props", () => {
    const content = readFile("src/ui/components/legal-page.tsx");
    assert.ok(content.includes("title"), "LegalPage missing title prop");
    assert.ok(
      content.includes("lastUpdated"),
      "LegalPage missing lastUpdated prop",
    );
    assert.ok(content.includes("intro"), "LegalPage missing intro prop");
    assert.ok(
      content.includes("sections"),
      "LegalPage missing sections prop",
    );
  });
});

// ─── 8. Footer i18n keys exist ──────────────────────────────────────────────

describe("Phase 8: footer i18n keys", () => {
  const locales = ["zh-TW", "en"];
  const requiredKeys = [
    "shopTitle",
    "supportTitle",
    "links.terms",
    "links.privacy",
    "links.refundPolicy",
    "links.shippingInfo",
  ];

  for (const locale of locales) {
    for (const key of requiredKeys) {
      it(`${locale}.json footer has ${key}`, () => {
        const msg = loadJson(`messages/${locale}.json`);
        const footer = msg.footer as Record<string, unknown>;
        const parts = key.split(".");
        let val: unknown = footer;
        for (const part of parts) {
          val = (val as Record<string, unknown>)?.[part];
        }
        assert.ok(
          val !== undefined && val !== "",
          `${locale}.json footer missing key: ${key}`,
        );
      });
    }
  }
});
