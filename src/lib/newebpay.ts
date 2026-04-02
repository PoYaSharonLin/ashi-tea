/**
 * NewebPay (藍新金流) MPG 2.0 integration utilities
 *
 * Docs: https://www.newebpay.com/website/Page/content/download_api
 * Test gateway: https://ccore.newebpay.com/MPG/mpg_gateway
 * Prod gateway: https://core.newebpay.com/MPG/mpg_gateway
 */
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";

/* -------------------------------------------------------------------------- */
/*                              Shipping logic                                */
/* -------------------------------------------------------------------------- */

export const FREE_SHIPPING_THRESHOLD = 1200; // NT$

export const SHIPPING_FEES = {
  home_delivery: 150,
  seven_eleven: 60,
  family_mart: 60,
} as const;

export type ShippingMethod = keyof typeof SHIPPING_FEES;

export function calcShippingFee(method: ShippingMethod, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEES[method];
}

/* -------------------------------------------------------------------------- */
/*                         AES-256-CBC helpers                                */
/* -------------------------------------------------------------------------- */

/** AES-256-CBC encrypt → lowercase hex */
export function encryptAES(data: string, hashKey: string, hashIV: string): string {
  const cipher = createCipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey, "utf-8"),
    Buffer.from(hashIV, "utf-8"),
  );
  return cipher.update(data, "utf-8", "hex") + cipher.final("hex");
}

/** AES-256-CBC decrypt hex → string */
export function decryptAES(hex: string, hashKey: string, hashIV: string): string {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey, "utf-8"),
    Buffer.from(hashIV, "utf-8"),
  );
  return decipher.update(hex, "hex", "utf-8") + decipher.final("utf-8");
}

/** SHA256("HashKey=<key>&<tradeInfo>&HashIV=<iv>").toUpperCase() */
export function generateTradeSha(
  tradeInfo: string,
  hashKey: string,
  hashIV: string,
): string {
  const raw = `HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIV}`;
  return createHash("sha256").update(raw).digest("hex").toUpperCase();
}

export function verifyTradeSha(
  tradeInfo: string,
  tradeSha: string,
  hashKey: string,
  hashIV: string,
): boolean {
  return generateTradeSha(tradeInfo, hashKey, hashIV) === tradeSha;
}

/* -------------------------------------------------------------------------- */
/*                            Gateway URL                                     */
/* -------------------------------------------------------------------------- */

export function getMpgGatewayUrl(): string {
  return process.env.NEWEBPAY_ENV === "production"
    ? "https://core.newebpay.com/MPG/mpg_gateway"
    : "https://ccore.newebpay.com/MPG/mpg_gateway";
}

/* -------------------------------------------------------------------------- */
/*                         Build MPG form data                                */
/* -------------------------------------------------------------------------- */

export interface MpgBuildParams {
  merchantOrderNo: string;
  amt: number;         // NT$ integer, no decimals
  itemDesc: string;    // max 50 chars
  email: string;
  returnUrl: string;
  notifyUrl: string;
  clientBackUrl: string;
}

export interface MpgFormData {
  gatewayUrl: string;
  fields: Record<string, string>;
}

/**
 * Build the encrypted MPG form data to POST to NewebPay.
 * Reads NEWEBPAY_MERCHANT_ID / HASH_KEY / HASH_IV from env.
 */
export function buildMpgFormData(params: MpgBuildParams): MpgFormData {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID ?? "";
  const hashKey = process.env.NEWEBPAY_HASH_KEY ?? "";
  const hashIV = process.env.NEWEBPAY_HASH_IV ?? "";

  const timeStamp = Math.floor(Date.now() / 1000).toString();

  const tradeInfoStr = new URLSearchParams({
    MerchantID: merchantId,
    RespondType: "JSON",
    TimeStamp: timeStamp,
    Version: "2.0",
    MerchantOrderNo: params.merchantOrderNo,
    Amt: params.amt.toString(),
    ItemDesc: params.itemDesc.slice(0, 50),
    Email: params.email,
    ReturnURL: params.returnUrl,
    NotifyURL: params.notifyUrl,
    ClientBackURL: params.clientBackUrl,
    CREDIT: "1",        // 信用卡
    WEBATM: "1",        // 網路 ATM
    VACC: "1",          // ATM 轉帳
  }).toString();

  const tradeInfo = encryptAES(tradeInfoStr, hashKey, hashIV);
  const tradeSha = generateTradeSha(tradeInfo, hashKey, hashIV);

  return {
    gatewayUrl: getMpgGatewayUrl(),
    fields: {
      MerchantID: merchantId,
      TradeInfo: tradeInfo,
      TradeSha: tradeSha,
      Version: "2.0",
      RespondType: "JSON",
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                       Parse NewebPay notify/return                         */
/* -------------------------------------------------------------------------- */

export interface TradeResult {
  MerchantID: string;
  Amt: number;
  TradeNo: string;
  MerchantOrderNo: string;
  PaymentType: string;
  PayTime: string;
}

export interface TradeNotifyPayload {
  Status: string;   // SUCCESS | FAIL
  Message: string;
  Result?: TradeResult;
}

/**
 * Verify TradeSha and decrypt TradeInfo from a NewebPay notify/return POST.
 * Returns null if signature invalid or decryption fails.
 */
export function parseTradePayload(
  tradeInfo: string,
  tradeSha: string,
  hashKey: string,
  hashIV: string,
): TradeNotifyPayload | null {
  if (!verifyTradeSha(tradeInfo, tradeSha, hashKey, hashIV)) return null;
  try {
    const decrypted = decryptAES(tradeInfo, hashKey, hashIV);
    return JSON.parse(decrypted) as TradeNotifyPayload;
  } catch {
    return null;
  }
}
