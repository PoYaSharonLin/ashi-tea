import { relations } from "drizzle-orm";

import { userTable } from "../users/tables";
import { productTable, productVariantTable } from "../products/tables";
import { cartItemTable } from "./tables";

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  user: one(userTable, {
    fields: [cartItemTable.userId],
    references: [userTable.id],
  }),
  product: one(productTable, {
    fields: [cartItemTable.productId],
    references: [productTable.id],
  }),
  variant: one(productVariantTable, {
    fields: [cartItemTable.variantId],
    references: [productVariantTable.id],
  }),
}));
