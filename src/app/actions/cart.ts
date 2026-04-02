"use server";

import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { auth } from "~/lib/auth";
import { db } from "~/db";
import { cartItemTable, productVariantTable } from "~/db/schema";
import type { CartItemWithDetails } from "~/db/schema";
import { headers } from "next/headers";

async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function getDbCart(): Promise<CartItemWithDetails[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const items = await db.query.cartItemTable.findMany({
    where: eq(cartItemTable.userId, userId),
    with: {
      product: true,
      variant: true,
    },
  });

  return items as CartItemWithDetails[];
}

export async function addToDbCart(
  variantId: string,
  quantity: number,
): Promise<{ success: boolean; error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "not_authenticated" };

  const variant = await db.query.productVariantTable.findFirst({
    where: and(
      eq(productVariantTable.id, variantId),
      eq(productVariantTable.isActive, true),
    ),
  });
  if (!variant) return { success: false, error: "variant_not_found" };
  if (variant.stock < quantity) return { success: false, error: "out_of_stock" };

  await db
    .insert(cartItemTable)
    .values({
      id: nanoid(),
      userId,
      productId: variant.productId,
      variantId,
      quantity,
    })
    .onConflictDoUpdate({
      target: [cartItemTable.userId, cartItemTable.variantId],
      set: {
        quantity: sql`${cartItemTable.quantity} + ${quantity}`,
      },
    });

  return { success: true };
}

export async function removeFromDbCart(
  cartItemId: string,
): Promise<{ success: boolean }> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false };

  await db
    .delete(cartItemTable)
    .where(
      and(eq(cartItemTable.id, cartItemId), eq(cartItemTable.userId, userId)),
    );

  return { success: true };
}

export async function updateDbCartQuantity(
  cartItemId: string,
  quantity: number,
): Promise<{ success: boolean }> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false };

  if (quantity <= 0) {
    await db
      .delete(cartItemTable)
      .where(
        and(eq(cartItemTable.id, cartItemId), eq(cartItemTable.userId, userId)),
      );
  } else {
    await db
      .update(cartItemTable)
      .set({ quantity })
      .where(
        and(eq(cartItemTable.id, cartItemId), eq(cartItemTable.userId, userId)),
      );
  }

  return { success: true };
}
