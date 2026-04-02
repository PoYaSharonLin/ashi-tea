"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "~/lib/hooks/use-cart";
import { createOrder } from "~/app/actions/orders";
import type { CheckoutCartItem } from "~/app/actions/orders";
import { SHIPPING_FEES, FREE_SHIPPING_THRESHOLD } from "~/lib/newebpay";
import type { ShippingMethod } from "~/lib/newebpay";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";
import { Textarea } from "~/ui/primitives/textarea";

interface CheckoutFormProps {
  userEmail: string;
  userName: string;
}

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  home_delivery: "宅配到府 (NT$ 150，滿 NT$ 1,200 免運)",
  seven_eleven: "7-11 超商取貨 (NT$ 60，滿 NT$ 1,200 免運)",
  family_mart: "全家超商取貨 (NT$ 60，滿 NT$ 1,200 免運)",
};

export function CheckoutForm({ userEmail, userName }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [shippingMethod, setShippingMethod] =
    React.useState<ShippingMethod>("home_delivery");
  const [recipientName, setRecipientName] = React.useState(userName);
  const [recipientEmail, setRecipientEmail] = React.useState(userEmail);
  const [recipientPhone, setRecipientPhone] = React.useState("");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [shippingStoreName, setShippingStoreName] = React.useState("");
  const [shippingStoreId, setShippingStoreId] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<null | string>(null);

  // Refs for hidden form submission to NewebPay
  const mpgFormRef = React.useRef<HTMLFormElement>(null);
  const [mpgFields, setMpgFields] = React.useState<Record<string, string>>({});
  const [gatewayUrl, setGatewayUrl] = React.useState("");

  // Calculate shipping fee
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEES[shippingMethod];
  const total = subtotal + shippingFee;

  // Auto-submit MPG form once fields are populated
  React.useEffect(() => {
    if (gatewayUrl && Object.keys(mpgFields).length > 0 && mpgFormRef.current) {
      mpgFormRef.current.submit();
    }
  }, [gatewayUrl, mpgFields]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">購物車是空的</p>
        <Button asChild variant="outline">
          <Link href="/products">去選購</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cartItems: CheckoutCartItem[] = items.map((item) => {
      const [productId, variantId] = item.id.split("-", 2);
      return {
        productId: productId ?? item.id,
        variantId: variantId ?? item.id,
        quantity: item.quantity,
      };
    });

    const result = await createOrder({
      recipientName,
      recipientEmail,
      recipientPhone,
      shippingMethod,
      shippingAddress: shippingMethod === "home_delivery" ? shippingAddress : undefined,
      shippingStoreName:
        shippingMethod !== "home_delivery" ? shippingStoreName : undefined,
      shippingStoreId:
        shippingMethod !== "home_delivery" ? shippingStoreId : undefined,
      note: note || undefined,
      items: cartItems,
    });

    if (!result.ok) {
      setIsSubmitting(false);
      const messages: Record<string, string> = {
        not_authenticated: "請先登入後再結帳",
        cart_empty: "購物車是空的",
        db_error: "訂單建立失敗，請稍後再試",
      };
      setError(messages[result.error] ?? `建立訂單失敗：${result.error}`);
      return;
    }

    // Clear cart and hand off to NewebPay
    clearCart();
    setGatewayUrl(result.mpgFormData.gatewayUrl);
    setMpgFields(result.mpgFormData.fields);
    // useEffect will submit the hidden form
  }

  return (
    <>
      {/* Hidden MPG form auto-submitted to NewebPay */}
      {gatewayUrl && (
        <form
          action={gatewayUrl}
          method="POST"
          ref={mpgFormRef}
          style={{ display: "none" }}
        >
          {Object.entries(mpgFields).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))}
        </form>
      )}

      <form className="grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={handleSubmit}>
        {/* Left: form fields */}
        <div className="space-y-8 lg:col-span-2">
          {/* 收件人資料 */}
          <section className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">收件人資料</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="王小明"
                  required
                  value={recipientName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手機號碼 *</Label>
                <Input
                  id="phone"
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  pattern="09[0-9]{8}"
                  placeholder="09xxxxxxxx"
                  required
                  title="請輸入 09 開頭的 10 位手機號碼"
                  type="tel"
                  value={recipientPhone}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  type="email"
                  value={recipientEmail}
                />
              </div>
            </div>
          </section>

          {/* 物流選擇 */}
          <section className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">物流方式</h2>
            <div className="space-y-3">
              {(Object.keys(SHIPPING_FEES) as ShippingMethod[]).map((method) => (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  key={method}
                >
                  <input
                    checked={shippingMethod === method}
                    className="mt-0.5"
                    name="shipping"
                    onChange={() => setShippingMethod(method)}
                    type="radio"
                    value={method}
                  />
                  <span className="text-sm">{SHIPPING_LABELS[method]}</span>
                </label>
              ))}
            </div>

            {/* 宅配地址 */}
            {shippingMethod === "home_delivery" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="address">收件地址 *</Label>
                <Input
                  id="address"
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="台北市信義區信義路五段 7 號"
                  required={shippingMethod === "home_delivery"}
                  value={shippingAddress}
                />
              </div>
            )}

            {/* 超商資料 */}
            {shippingMethod !== "home_delivery" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">超商店名 *</Label>
                  <Input
                    id="storeName"
                    onChange={(e) => setShippingStoreName(e.target.value)}
                    placeholder="信義門市"
                    required={shippingMethod !== "home_delivery"}
                    value={shippingStoreName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeId">超商店號 *</Label>
                  <Input
                    id="storeId"
                    onChange={(e) => setShippingStoreId(e.target.value)}
                    placeholder="123456"
                    required={shippingMethod !== "home_delivery"}
                    value={shippingStoreId}
                  />
                </div>
              </div>
            )}
          </section>

          {/* 備註 */}
          <section className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">備註（選填）</h2>
            <Textarea
              onChange={(e) => setNote(e.target.value)}
              placeholder="其他備註事項..."
              rows={3}
              value={note}
            />
          </section>
        </div>

        {/* Right: order summary */}
        <div>
          <div className="sticky top-24 rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">訂單摘要</h2>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div className="flex justify-between text-sm" key={item.id}>
                  <span className="flex-1 text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>NT$ {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品小計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  運費
                  {shippingFee === 0 && (
                    <span className="ml-1 text-green-600">（免運）</span>
                  )}
                </span>
                <span>
                  {shippingFee === 0 ? "免費" : `NT$ ${shippingFee}`}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>合計</span>
              <span>NT$ {total.toLocaleString()}</span>
            </div>

            {error && (
              <p className="mt-3 rounded-md bg-destructive/10 p-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              className="mt-6 w-full"
              disabled={isSubmitting}
              size="lg"
              type="submit"
            >
              {isSubmitting ? "處理中..." : "前往付款"}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              付款由藍新金流安全處理
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
