import { relations } from "drizzle-orm";

import { userTable } from "../users/tables";
import { productTable, productVariantTable } from "../products/tables";
import { orderTable, orderItemTable } from "./tables";

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  items: many(orderItemTable),
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  product: one(productTable, {
    fields: [orderItemTable.productId],
    references: [productTable.id],
  }),
  variant: one(productVariantTable, {
    fields: [orderItemTable.variantId],
    references: [productVariantTable.id],
  }),
}));
