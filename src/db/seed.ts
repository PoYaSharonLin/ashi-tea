/**
 * Seed script — insert demo tea products for development/staging.
 *
 * Usage:
 *   node --experimental-strip-types src/db/seed.ts
 *
 * Requires DATABASE_URL in .env.local (or environment).
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";

import { productTable, productVariantTable } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const conn = postgres(process.env.DATABASE_URL);
const db = drizzle(conn);

const products = [
  {
    id: nanoid(),
    name: "阿里山烏龍茶",
    nameEn: "Alishan Oolong Tea",
    description: "來自阿里山高山茶區，海拔 1,500 公尺以上栽培，茶湯清澈甘甜，帶有淡雅花香。",
    descriptionEn:
      "Grown at over 1,500m elevation in Alishan, this oolong delivers a clear, sweet cup with delicate floral notes.",
    category: "loose_leaf" as const,
    images: [
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    variants: [
      { name: "150g", nameEn: "150g", sku: "ALISHAN-150", price: "450", compareAtPrice: null, stock: 50 },
      { name: "300g", nameEn: "300g", sku: "ALISHAN-300", price: "850", compareAtPrice: "900", stock: 30 },
      { name: "600g 禮盒", nameEn: "600g Gift Box", sku: "ALISHAN-600G", price: "1600", compareAtPrice: "1800", stock: 15 },
    ],
  },
  {
    id: nanoid(),
    name: "東方美人茶",
    nameEn: "Oriental Beauty Tea",
    description: "又稱「白毫烏龍」，經過小綠葉蟬啃食，激發出天然蜜糖香，是台灣獨有的茶品。",
    descriptionEn:
      "Known as 'White Tip Oolong', bitten by tea green leafhoppers to produce natural honey aromas unique to Taiwan.",
    category: "loose_leaf" as const,
    images: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=60",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    variants: [
      { name: "75g", nameEn: "75g", sku: "OB-75", price: "600", compareAtPrice: null, stock: 25 },
      { name: "150g", nameEn: "150g", sku: "OB-150", price: "1100", compareAtPrice: "1200", stock: 20 },
    ],
  },
  {
    id: nanoid(),
    name: "日月潭紅茶",
    nameEn: "Sun Moon Lake Black Tea",
    description: "台灣知名紅茶產區，茶湯呈琥珀色，滋味醇厚，帶有天然肉桂與薄荷香。",
    descriptionEn:
      "From Taiwan's famous black tea region, amber-colored with a rich body and hints of natural cinnamon and mint.",
    category: "loose_leaf" as const,
    images: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=60",
    ],
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    variants: [
      { name: "100g", nameEn: "100g", sku: "SML-100", price: "350", compareAtPrice: null, stock: 60 },
      { name: "200g", nameEn: "200g", sku: "SML-200", price: "650", compareAtPrice: "700", stock: 40 },
    ],
  },
  {
    id: nanoid(),
    name: "熹茶 精選禮盒",
    nameEn: "Ashi Tea Premium Gift Set",
    description: "精選三款台灣高山茶，附贈精美茶罐與提袋，適合饋贈親友。",
    descriptionEn:
      "Three premium Taiwanese highland teas in elegant canisters with gift bag. Perfect for gifting.",
    category: "gift_box" as const,
    images: [
      "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&auto=format&fit=crop&q=60",
    ],
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    variants: [
      { name: "三入禮盒", nameEn: "3-Tin Gift Set", sku: "GIFT-3TIN", price: "1680", compareAtPrice: "1980", stock: 20 },
      { name: "六入禮盒", nameEn: "6-Tin Gift Set", sku: "GIFT-6TIN", price: "3200", compareAtPrice: "3800", stock: 10 },
    ],
  },
  {
    id: nanoid(),
    name: "阿里山烏龍茶包",
    nameEn: "Alishan Oolong Tea Bags",
    description: "精選阿里山烏龍茶製成方便茶包，沖泡簡便，隨時享受高山好茶。",
    descriptionEn:
      "Alishan oolong in convenient pyramid tea bags. Easy to brew, great taste anywhere.",
    category: "tea_bag" as const,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60",
    ],
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
    variants: [
      { name: "20入", nameEn: "20 bags", sku: "TB-ALISHAN-20", price: "280", compareAtPrice: null, stock: 100 },
      { name: "40入", nameEn: "40 bags", sku: "TB-ALISHAN-40", price: "520", compareAtPrice: "560", stock: 80 },
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
