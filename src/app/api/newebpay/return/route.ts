/**
 * NewebPay 付款完成導回 (ReturnURL)
 *
 * 藍新金流付款後將用戶 POST 到此 endpoint。
 * 驗證後導向結果頁 /checkout/result。
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseTradePayload } from "~/lib/newebpay";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const tradeInfo = formData.get("TradeInfo")?.toString() ?? "";
  const tradeSha = formData.get("TradeSha")?.toString() ?? "";

  const hashKey = process.env.NEWEBPAY_HASH_KEY ?? "";
  const hashIV = process.env.NEWEBPAY_HASH_IV ?? "";

  const base = new URL(req.url).origin;

  const payload = parseTradePayload(tradeInfo, tradeSha, hashKey, hashIV);
  if (!payload) {
    return NextResponse.redirect(`${base}/checkout/result?status=error`);
  }

  if (payload.Status === "SUCCESS" && payload.Result) {
    const orderNumber = payload.Result.MerchantOrderNo;
    return NextResponse.redirect(
      `${base}/checkout/result?status=success&order=${encodeURIComponent(orderNumber)}`,
    );
  }

  return NextResponse.redirect(`${base}/checkout/result?status=fail`);
}
