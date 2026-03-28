import type { InferSelectModel } from "drizzle-orm";
import type { Product, ProductVariant } from "../products/types";
import { cartItemTable } from "./tables";

export type CartItem = InferSelectModel<typeof cartItemTable>;

export type CartItemWithDetails = CartItem & {
  product: Product;
  variant: ProductVariant;
};
