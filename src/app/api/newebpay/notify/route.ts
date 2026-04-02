/**
 * NewebPay 背景通知 (NotifyURL)
 *
 * 藍新金流在付款完成後透過 POST 打到此 endpoint。
 * 驗證 TradeSha、解密 TradeInfo、更新訂單狀態。
 */
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "~/db";
import { orderTable } from "~/db/schema";
import { parseTradePayload } from "~/lib/newebpay";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const tradeInfo = formData.get("TradeInfo")?.toString() ?? "";
  const tradeSha = formData.get("TradeSha")?.toString() ?? "";

  const hashKey = process.env.NEWEBPAY_HASH_KEY ?? "";
  const hashIV = process.env.NEWEBPAY_HASH_IV ?? "";

  const payload = parseTradePayload(tradeInfo, tradeSha, hashKey, hashIV);
  if (!payload) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (payload.Status === "SUCCESS" && payload.Result) {
    const { MerchantOrderNo, TradeNo, PaymentType, PayTime } = payload.Result;

    // PayTime format from NewebPay: "2024-01-01 12:00:00"
    const paidAt = PayTime ? new Date(PayTime.replace(" ", "T") + "Z") : new Date();

    await db
      .update(orderTable)
      .set({
        status: "paid",
        newebpayTradeNo: TradeNo,
        paymentMethod: PaymentType,
        paidAt,
        updatedAt: new Date(),
      })
      .where(eq(orderTable.orderNumber, MerchantOrderNo));
  }

  // NewebPay expects plain "OK" response
  return new Response("OK", { status: 200 });
}
