"use server";

import { and, asc, eq } from "drizzle-orm";

import { db } from "~/db";
import {
  productTable,
  productVariantTable,
  type ProductWithVariants,
} from "~/db/schema";

export async function getFeaturedProducts(): Promise<ProductWithVariants[]> {
  const products = await db.query.productTable.findMany({
    where: and(eq(productTable.isActive, true), eq(productTable.isFeatured, true)),
    orderBy: [asc(productTable.sortOrder)],
    with: {
      variants: {
        where: eq(productVariantTable.isActive, true),
        orderBy: [asc(productVariantTable.sortOrder)],
      },
    },
  });
  return products as ProductWithVariants[];
}

export async function getProducts(category?: string): Promise<ProductWithVariants[]> {
  const conditions = [eq(productTable.isActive, true)];

  if (
    category &&
    category !== "all" &&
    ["loose_leaf", "tea_brick", "mixed_gift_box", "gift_box", "tea_bag", "accessory"].includes(category)
  ) {
    conditions.push(
      eq(
        productTable.category,
        category as "loose_leaf" | "tea_brick" | "mixed_gift_box" | "gift_box" | "tea_bag" | "accessory",
      ),
    );
  }

  const products = await db.query.productTable.findMany({
    where: and(...conditions),
    orderBy: [asc(productTable.sortOrder), asc(productTable.createdAt)],
    with: {
      variants: {
        where: eq(productVariantTable.isActive, true),
        orderBy: [asc(productVariantTable.sortOrder)],
      },
    },
  });

  return products as ProductWithVariants[];
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const product = await db.query.productTable.findFirst({
    where: and(eq(productTable.id, id), eq(productTable.isActive, true)),
    with: {
      variants: {
        where: eq(productVariantTable.isActive, true),
        orderBy: [asc(productVariantTable.sortOrder)],
      },
    },
  });

  return (product as ProductWithVariants | undefined) ?? null;
}
