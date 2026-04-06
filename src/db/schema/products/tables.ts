import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const productCategoryEnum = pgEnum("product_category", [
  "loose_leaf",      // 散茶
  "tea_brick",       // 茶磚
  "mixed_gift_box",  // 綜合禮盒
  "gift_box",        // 禮盒（保留相容）
  "tea_bag",         // 茶包（保留相容）
  "accessory",       // 茶具配件（保留相容）
]);

export const productTable = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),           // 商品名稱（中文）
  nameEn: text("name_en"),                // 商品名稱（英文）
  description: text("description"),       // 商品描述（中文）
  descriptionEn: text("description_en"),  // 商品描述（英文）
  category: productCategoryEnum("category").notNull().default("loose_leaf"),
  images: text("images").array(),         // 圖片 URL 陣列
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 商品變體（克數、口味、禮盒尺寸等）
export const productVariantTable = pgTable("product_variant", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),           // 變體名稱（中文），例：150g、精裝版
  nameEn: text("name_en"),                // 變體名稱（英文）
  sku: text("sku").unique(),              // 商品編號
  price: numeric("price", { precision: 10, scale: 0 }).notNull(), // 台幣，整數
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 0 }), // 原價
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
