import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { userTable } from "../users/tables";
import { productTable, productVariantTable } from "../products/tables";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",        // 待付款
  "paid",           // 已付款
  "processing",     // 處理中
  "shipped",        // 已出貨
  "delivered",      // 已送達
  "cancelled",      // 已取消
  "refunded",       // 已退款
]);

export const shippingMethodEnum = pgEnum("shipping_method", [
  "seven_eleven",   // 7-11 超商取貨
  "family_mart",    // 全家超商取貨
  "home_delivery",  // 宅配到府
]);

export const orderTable = pgTable("order", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // 訂單編號，例：AT-20240101-001
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),

  status: orderStatusEnum("status").notNull().default("pending"),

  // 金額
  subtotal: numeric("subtotal", { precision: 10, scale: 0 }).notNull(),
  shippingFee: numeric("shipping_fee", { precision: 10, scale: 0 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 0 }).notNull(),

  // 物流
  shippingMethod: shippingMethodEnum("shipping_method").notNull(),
  shippingStoreName: text("shipping_store_name"),    // 超商店名
  shippingStoreId: text("shipping_store_id"),        // 超商店號
  shippingAddress: text("shipping_address"),          // 宅配地址

  // 收件人
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  recipientEmail: text("recipient_email").notNull(),

  // 藍新金流
  newebpayTradeNo: text("newebpay_trade_no"),        // 藍新交易序號
  newebpayMerchantOrderNo: text("newebpay_merchant_order_no"), // 商店訂單編號
  paymentMethod: text("payment_method"),              // CREDIT, LINEPAY, ANDROIDPAY, ...

  // 物流追蹤
  trackingNumber: text("tracking_number"),

  // 備註
  note: text("note"),

  paidAt: timestamp("paid_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemTable = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orderTable.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "restrict" }),
  variantId: text("variant_id")
    .references(() => productVariantTable.id, { onDelete: "restrict" }),

  // 快照（下單時記錄，防止商品資訊變動影響訂單）
  productName: text("product_name").notNull(),
  variantName: text("variant_name"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 0 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 0 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
