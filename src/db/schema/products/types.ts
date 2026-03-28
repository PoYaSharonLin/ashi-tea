import type { InferSelectModel } from "drizzle-orm";
import { productTable, productVariantTable } from "./tables";

export type Product = InferSelectModel<typeof productTable>;
export type ProductVariant = InferSelectModel<typeof productVariantTable>;

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};
