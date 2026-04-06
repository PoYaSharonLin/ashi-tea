/**
 * Seed script — insert demo tea products for development/staging.
 *
 * Usage:
 *   node --experimental-strip-types src/db/seed.ts
 *
 * Requires DATABASE_URL in .env.local (or environment).
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";

import { productTable, productVariantTable } from "./schema/products/tables.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const conn = postgres(process.env.DATABASE_URL);
const db = drizzle(conn);

type VariantSeed = {
  name: string;
  nameEn: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
};

const products: Array<{
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: "loose_leaf" | "tea_brick" | "mixed_gift_box" | "gift_box" | "tea_bag" | "accessory";
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  variants: VariantSeed[];
}> = [
  {
    id: nanoid(),
    name: "蜜涎紅茶",
    nameEn: "Honey Scented Black Tea",
    description: "來自六龜山區，茶湯呈琥珀色，入口甘醇、圓潤帶有蜜香",
    descriptionEn:
      "Sourced from the Liugui mountain region, the tea liquor presents a warm amber hue. Smooth and mellow on the palate with a sweet honey-like aroma.",
    category: "loose_leaf" as const,
    images: [
      "https://images.unsplash.com/photo-1627764611688-2d07255e995e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    variants: [
      { name: "75g", nameEn: "75g", sku: "HONEYBLACKTEA-150", price: "1000", compareAtPrice: null, stock: 50 },
      { name: "150g 禮盒", nameEn: "150g Giftbox", sku: "HONEYBLACKTEA-300", price: "2300", compareAtPrice: null, stock: 30 },
    ],
  },
  {
    id: nanoid(),
    name: "雲南普洱茶",
    nameEn: "Yunnan Pu'er Tea",
    description: "採用雲南大葉種曬青毛茶製成，湯色紅濃明亮、滋味醇厚回甘，層次感豐富",
    descriptionEn:
      "Crafted from Yunnan's prized large-leaf sun-dried maocha, this Pu'er yields a deep, luminous ruby-red liquor. Rich and full-bodied in flavor, it unfolds with intricate layers and a lingering, profound sweetness.",
    category: "tea_brick" as const,
    images: [
      "https://images.unsplash.com/photo-1628153915053-9a493ee1a27e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    variants: [
      { name: "250g", nameEn: "250g", sku: "YUNNAN-250", price: "300", compareAtPrice: null, stock: 25 },
      { name: "500g 茶磚禮盒", nameEn: "500g Tea Brick Gift Box", sku: "YUNNAN-500G", price: "900", compareAtPrice: null, stock: 20 },
    ],
  },
  {
    id: nanoid(),
    name: "冰島普洱茶",
    nameEn: "Ice Island Pu-erh Tea",
    description: "冰島五寨（老寨、地界、南迫、壩歪、糯伍）生產之普洱，乾茶香氣馥郁，沖泡後帶有高雅的蜂蜜香、蘭花香，以及淡淡的冰糖香",
    descriptionEn:
      "Produced from the five ancient villages of Bingdao—Old Village, Land Boundary, Southern Slope, Damwai, and Nuowu—this Pu'er tea carries an intensely fragrant dry-leaf aroma. When brewed, it reveals elegant honey notes, graceful orchid fragrance, and a subtle, crystal-like rock sugar sweetness.",
    category: "tea_brick" as const,
    images: [
      "https://images.unsplash.com/photo-1577016029703-cc22a7c0c28c?q=80&w=757&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    variants: [
      { name: "500g", nameEn: "500g", sku: "BINGDAO-500", price: "1000", compareAtPrice: null, stock: 60 },
      { name: "1000g 茶磚禮盒", nameEn: "1000g Tea Brick Gift Box", sku: "BINGDAO-1000G", price: "2300", compareAtPrice: null, stock: 40 },
    ],
  },
  {
    id: nanoid(),
    name: "熹茶 精選禮盒",
    nameEn: "Ashi Tea Premium Gift Set",
    description: "精選三款茶品，附贈精美茶罐與提袋，適合禮賓。",
    descriptionEn:
      "Three premium Taiwanese highland teas in elegant canisters with gift bag. Perfect for gifting.",
    category: "mixed_gift_box" as const,
    images: [
      "https://images.unsplash.com/photo-1575112946192-37008ecd1e4d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    variants: [
      { name: "三入禮盒", nameEn: "3-Tin Gift Set", sku: "GIFT-3TIN", price: "2600", compareAtPrice: null, stock: 20 },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding products...");

  for (const { variants, ...productData } of products) {
    await db.insert(productTable).values(productData).onConflictDoNothing();

    for (const variant of variants) {
      await db
        .insert(productVariantTable)
        .values({
          id: nanoid(),
          productId: productData.id,
          ...variant,
          sortOrder: variants.indexOf(variant),
        })
        .onConflictDoNothing();
    }

    console.log(`  ✓ ${productData.name}`);
  }

  console.log("✅ Seed complete.");
  await conn.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
