import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

import { db } from "~/db";
import { productTable } from "~/db/schema";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const staticRoutes = [
  "/",
  "/products",
  "/cart",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/shipping-info",
  "/tea-storage",
  "/tea-brewing",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db
    .select({ id: productTable.id, updatedAt: productTable.updatedAt })
    .from(productTable)
    .where(eq(productTable.isActive, true));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) => [
    {
      url: `${BASE_URL}${route}`,
      changeFrequency: "weekly",
      priority: route === "/" ? 1 : 0.8,
    },
    {
      url: `${BASE_URL}/en${route === "/" ? "" : route}`,
      changeFrequency: "weekly",
      priority: route === "/" ? 1 : 0.8,
    },
  ]);

  const productEntries: MetadataRoute.Sitemap = products.flatMap((p) => [
    {
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]);

  return [...staticEntries, ...productEntries];
}
