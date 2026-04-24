/**
 * Phase 5 — Member Center Tests
 *
 * Validates:
 * 1. Required files exist (account pages, actions, components)
 * 2. /dashboard is fully removed
 * 3. Header no longer references /dashboard
 * 4. getUserOrders + updateProfile are exported
 * 5. AccountNav component exists
 *
 * Run: node --experimental-strip-types .tests/phase5.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");

// ─── 1. Required files exist ──────────────────────────────────────────────────

describe("Phase 5: required files exist", () => {
  const files = [
    // Account pages
    "src/app/account/layout.tsx",
    "src/app/account/page.tsx",
    "src/app/account/orders/page.tsx",
    "src/app/account/orders/[orderNumber]/page.tsx",
    "src/app/account/profile/page.tsx",
    "src/app/account/profile/_components/profile-form.tsx",
    "src/app/account/_components/account-nav.tsx",
    // Actions
    "src/app/actions/user.ts",
    "src/app/actions/orders.ts",
  ];

  for (const file of files) {
    it(`${file} exists`, () => {
      assert.ok(existsSync(resolve(ROOT, file)), `Missing: ${file}`);
    });
  }
});

// ─── 2. /dashboard is removed ─────────────────────────────────────────────────

describe("Phase 5: /dashboard directory is removed", () => {
  it("src/app/dashboard/ does not exist", () => {
    assert.ok(
      !existsSync(resolve(ROOT, "src/app/dashboard")),
      "src/app/dashboard/ should be deleted",
    );
  });
});

// ─── 3. Header no longer references /dashboard ───────────────────────────────

describe("Phase 5: header files do not reference /dashboard", () => {
  const headerFiles = [
    "src/ui/components/header/header.tsx",
    "src/ui/components/header/header-user.tsx",
  ];

  for (const file of headerFiles) {
    it(`${file} has no /dashboard links`, () => {
      const content = readFileSync(resolve(ROOT, file), "utf-8");
      assert.ok(
        !content.includes("/dashboard"),
        `${file} still contains /dashboard reference`,
      );
    });
  }
});

// ─── 4. getUserOrders exported from orders.ts ────────────────────────────────

describe("Phase 5: getUserOrders action", () => {
  it("orders.ts exports getUserOrders", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/actions/orders.ts"),
      "utf-8",
    );
    assert.ok(
      content.includes("export async function getUserOrders"),
      "getUserOrders not found in orders.ts",
    );
  });
});

// ─── 5. updateProfile exported from user.ts ──────────────────────────────────

describe("Phase 5: updateProfile action", () => {
  it("user.ts exports updateProfile", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/actions/user.ts"),
      "utf-8",
    );
    assert.ok(
      content.includes("export async function updateProfile"),
      "updateProfile not found in user.ts",
    );
  });

  it("user.ts has 'use server' directive", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/actions/user.ts"),
      "utf-8",
    );
    assert.ok(content.includes('"use server"'), "Missing 'use server' directive");
  });
});

// ─── 6. AccountNav is a client component ─────────────────────────────────────

describe("Phase 5: AccountNav", () => {
  it("account-nav.tsx has 'use client' directive", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/account/_components/account-nav.tsx"),
      "utf-8",
    );
    assert.ok(content.includes('"use client"'), "AccountNav must be a Client Component");
  });

  it("account-nav.tsx links to /account/orders and /account/profile", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/account/_components/account-nav.tsx"),
      "utf-8",
    );
    assert.ok(content.includes("/account/orders"), "Missing /account/orders link");
    assert.ok(content.includes("/account/profile"), "Missing /account/profile link");
  });
});

// ─── 7. ProfileForm is a client component ────────────────────────────────────

describe("Phase 5: ProfileForm", () => {
  it("profile-form.tsx has 'use client' directive", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/account/profile/_components/profile-form.tsx"),
      "utf-8",
    );
    assert.ok(content.includes('"use client"'), "ProfileForm must be a Client Component");
  });
});

// ─── 8. account/page.tsx redirects to orders ────────────────────────────────

describe("Phase 5: account root redirect", () => {
  it("account/page.tsx redirects to /account/orders", () => {
    const content = readFileSync(
      resolve(ROOT, "src/app/account/page.tsx"),
      "utf-8",
    );
    assert.ok(
      content.includes("/account/orders"),
      "account/page.tsx should redirect to /account/orders",
    );
  });
});
