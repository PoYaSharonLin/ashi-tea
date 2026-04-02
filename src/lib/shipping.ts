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
