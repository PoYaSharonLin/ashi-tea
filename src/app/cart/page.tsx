"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { useCart } from "~/lib/hooks/use-cart";
import { Button } from "~/ui/primitives/button";
import { Separator } from "~/ui/primitives/separator";

const FREE_SHIPPING_THRESHOLD = 1200;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 60;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">購物車</h1>
          <p className="mt-2 text-muted-foreground">您的購物車是空的</p>
          <p className="text-sm text-muted-foreground">快去挑選您喜愛的茶品吧！</p>
        </div>
        <Button asChild>
          <Link href="/products">繼續購物</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold">購物車</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                className="flex gap-4 rounded-lg border p-4"
                key={item.id}
              >
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image && (
                    <Image
                      alt={item.name}
                      className="object-cover"
                      fill
                      src={item.image}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{item.name}</p>
                    <button
                      aria-label="移除商品"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-md border">
                      <button
                        className="flex h-8 w-8 items-center justify-center border-r text-muted-foreground hover:bg-muted disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        type="button"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center border-l text-muted-foreground hover:bg-muted"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        type="button"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="font-medium">
                      NT$ {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button asChild variant="outline">
              <Link href="/products">繼續購物</Link>
            </Button>
            <Button onClick={clearCart} variant="ghost">
              清空購物車
            </Button>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">訂單摘要</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">商品小計</span>
              <span>NT$ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                運費
                {shippingFee === 0 && (
                  <span className="ml-1 text-green-600">（已免運）</span>
                )}
              </span>
              <span>
                {shippingFee === 0 ? "免費" : `NT$ ${shippingFee}`}
              </span>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-muted-foreground">
                滿 NT$ {FREE_SHIPPING_THRESHOLD.toLocaleString()} 免運費
              </p>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-semibold">
            <span>合計</span>
            <span>NT$ {total.toLocaleString()}</span>
          </div>

          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/checkout">前往結帳</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
