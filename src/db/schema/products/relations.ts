import { relations } from "drizzle-orm";

import { orderItemTable } from "../orders/tables";
import { cartItemTable } from "../cart/tables";
import { productTable, productVariantTable } from "./tables";

export const productRelations = relations(productTable, ({ many }) => ({
  variants: many(productVariantTable),
  orderItems: many(orderItemTable),
  cartItems: many(cartItemTable),
}));

export const productVariantRelations = relations(
  productVariantTable,
  ({ one, many }) => ({
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
    orderItems: many(orderItemTable),
    cartItems: many(cartItemTable),
  }),
);
