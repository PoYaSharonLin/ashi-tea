import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh-TW", "en"],
  defaultLocale: "zh-TW",
  localePrefix: "as-needed", // zh-TW 為 /，en 為 /en/...
  pathnames: {
    "/": "/",
    "/products": {
      "zh-TW": "/products",
      en: "/products",
    },
    "/products/[id]": {
      "zh-TW": "/products/[id]",
      en: "/products/[id]",
    },
    "/cart": "/cart",
    "/checkout": "/checkout",
    "/order-confirmation/[id]": "/order-confirmation/[id]",
    "/account": "/account",
    "/account/orders": "/account/orders",
    "/account/orders/[id]": "/account/orders/[id]",
    "/auth/sign-in": "/auth/sign-in",
    "/auth/sign-up": "/auth/sign-up",
  },
});

export type Locale = (typeof routing.locales)[number];
