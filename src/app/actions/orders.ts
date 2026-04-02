"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

import { auth } from "~/lib/auth";
import { db } from "~/db";
import { orderTable, orderItemTable, productVariantTable } from "~/db/schema";
import {
  buildMpgFormData,
  calcShippingFee,
  type MpgFormData,
  type ShippingMethod,
} from "~/lib/newebpay";

const APP_URL =
  process.env.NEXT_SERVER_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */

export interface CheckoutCartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  shippingMethod: ShippingMethod;
  shippingAddress?: string;
  shippingStoreName?: string;
  shippingStoreId?: string;
  note?: string;
  items: CheckoutCartItem[];
}

export type CreateOrderResult =
  | { ok: true; mpgFormData: MpgFormData; orderNumber: string }
  | { ok: false; error: string };

/* -------------------------------------------------------------------------- */
/*                          createOrder action                                */
/* -------------------------------------------------------------------------- */

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { ok: false, error: "not_authenticated" };

  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "cart_empty" };
  }

  // 2. Validate + price items from DB
  let resolvedItems: {
    productId: string;
    variantId: string;
    productName: string;
    variantName: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];

  try {
    resolvedItems = await Promise.all(
      input.items.map(async (item) => {
        const variant = await db.query.productVariantTable.findFirst({
          where: eq(productVariantTable.id, item.variantId),
          with: { product: true },
        });

        if (!variant?.product) {
          throw new Error(`variant_not_found:${item.variantId}`);
        }
        if (!variant.isActive || !variant.product.isActive) {
          throw new Error(`product_inactive:${item.variantId}`);
        }

        const unitPrice = Number(variant.price);
        return {
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name ?? null,
          unitPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
        };
      }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: msg };
  }

  // 3. Calculate amounts
  const subtotal = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const shippingFee = calcShippingFee(input.shippingMethod, subtotal);
  const total = subtotal + shippingFee;

  // 4. Generate order number: AT-YYYYMMDD-NNN
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const todayStart = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);

  const [countRow] = await db
    .select({ count: sql<string>`count(*)` })
    .from(orderTable)
    .where(gte(orderTable.createdAt, todayStart));

  const seq = (Number(countRow?.count ?? 0) + 1).toString().padStart(3, "0");
  const orderNumber = `AT-${dateStr}-${seq}`;
  const orderId = nanoid();

  // 5. Write order to DB (transaction)
  try {
    await db.transaction(async (tx) => {
      await tx.insert(orderTable).values({
        id: orderId,
        orderNumber,
        userId: session.user.id,
        status: "pending",
        subtotal: subtotal.toString(),
        shippingFee: shippingFee.toString(),
        total: total.toString(),
        shippingMethod: input.shippingMethod,
        shippingAddress: input.shippingAddress ?? null,
        shippingStoreName: input.shippingStoreName ?? null,
        shippingStoreId: input.shippingStoreId ?? null,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        recipientEmail: input.recipientEmail,
        newebpayMerchantOrderNo: orderNumber,
        note: input.note ?? null,
      });

      await tx.insert(orderItemTable).values(
        resolvedItems.map((item) => ({
          id: nanoid(),
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice.toString(),
          quantity: item.quantity.toString(),
          subtotal: item.subtotal.toString(),
        })),
      );
    });
  } catch (err) {
    console.error("createOrder DB error:", err);
    return { ok: false, error: "db_error" };
  }

  // 6. Build NewebPay MPG form data
  const mpgFormData = buildMpgFormData({
    merchantOrderNo: orderNumber,
    amt: total,
    itemDesc: resolvedItems.map((i) => i.productName).join(", "),
    email: input.recipientEmail,
    returnUrl: `${APP_URL}/api/newebpay/return`,
    notifyUrl: `${APP_URL}/api/newebpay/notify`,
    clientBackUrl: `${APP_URL}/checkout`,
  });

  return { ok: true, mpgFormData, orderNumber };
}

/* -------------------------------------------------------------------------- */
/*                         getOrderByNumber                                   */
/* -------------------------------------------------------------------------- */

export async function getOrderByNumber(orderNumber: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return db.query.orderTable.findFirst({
    where: and(
      eq(orderTable.orderNumber, orderNumber),
      eq(orderTable.userId, session.user.id),
    ),
    with: { items: true },
  });
}
