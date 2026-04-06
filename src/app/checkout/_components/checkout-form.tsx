"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";
import { useCart } from "~/lib/hooks/use-cart";
import { createOrder } from "~/app/actions/orders";
import { calcShippingFee, SHIPPING_FEES, FREE_SHIPPING_THRESHOLD } from "~/lib/newebpay";
import type { ShippingMethod } from "~/lib/newebpay";

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  home_delivery: "宅配到府",
  seven_eleven: "7-11 超商取貨",
  family_mart: "全家超商取貨",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [shippingMethod, setShippingMethod] = React.useState<ShippingMethod>("home_delivery");
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientPhone, setRecipientPhone] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [shippingStoreName, setShippingStoreName] = React.useState("");
  const [shippingStoreId, setShippingStoreId] = React.useState("");
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const shippingFee = calcShippingFee(shippingMethod, subtotal);
  const total = subtotal + shippingFee;
  const isConvenience = shippingMethod === "seven_eleven" || shippingMethod === "family_mart";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("購物車是空的");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createOrder({
      recipientName,
      recipientPhone,
      recipientEmail,
      shippingMethod,
      shippingAddress: isConvenience ? undefined : shippingAddress,
      shippingStoreName: isConvenience ? shippingStoreName : undefined,
      shippingStoreId: isConvenience ? shippingStoreId : undefined,
      note: note || undefined,
      items: items.map((item) => {
        const [productId, variantId] = item.id.split("-");
        return { productId: productId ?? item.id, variantId: variantId ?? item.id, quantity: item.quantity };
      }),
    });

    if (!result.ok) {
      setError(result.error === "not_authenticated" ? "請先登入才能結帳" : `發生錯誤：${result.error}`);
      setLoading(false);
      return;
    }

    // Clear cart then POST to NewebPay gateway via a hidden form
    clearCart();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = result.mpgFormData.gatewayUrl;

    for (const [key, value] of Object.entries(result.mpgFormData.fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>購物車是空的。</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/products")}>
          去逛逛
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      {/* ── Left: Form fields ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Shipping method */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">配送方式</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(SHIPPING_LABELS) as ShippingMethod[]).map((method) => {
              const fee = SHIPPING_FEES[method];
              const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setShippingMethod(method)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    shippingMethod === method
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{SHIPPING_LABELS[method]}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {isFree ? "免運" : `NT$ ${fee}`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recipient info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">收件資訊</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="王小明"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">手機</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="0912345678"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {isConvenience ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">超商店名</Label>
                <Input
                  id="storeName"
                  value={shippingStoreName}
                  onChange={(e) => setShippingStoreName(e.target.value)}
                  placeholder="信義門市"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeId">店號</Label>
                <Input
                  id="storeId"
                  value={shippingStoreId}
                  onChange={(e) => setShippingStoreId(e.target.value)}
                  placeholder="123456"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="address">配送地址</Label>
              <Input
                id="address"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="台北市信義區信義路五段7號"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="note">訂單備註（選填）</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：請勿在中午前配送"
            />
          </div>
        </section>
      </div>

      {/* ── Right: Order summary ── */}
      <div className="space-y-4">
        <div className="rounded-xl border p-5 space-y-4">
          <h2 className="text-lg font-semibold">訂單明細</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>NT$ {item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>小計</span>
              <span>NT$ {subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>運費</span>
              <span>{shippingFee === 0 ? "免運" : `NT$ ${shippingFee}`}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>總計</span>
            <span>NT$ {total}</span>
          </div>

          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className="text-xs text-muted-foreground">
              再消費 NT$ {FREE_SHIPPING_THRESHOLD - subtotal} 即可享免運
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "處理中..." : "前往付款"}
          </Button>
        </div>
      </div>
    </form>
  );
}
