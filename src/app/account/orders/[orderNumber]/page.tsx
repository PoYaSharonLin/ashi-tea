import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getOrderByNumber } from "~/app/actions/orders";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Separator } from "~/ui/primitives/separator";

const STATUS_LABELS: Record<string, string> = {
  pending: "待付款",
  paid: "已付款",
  processing: "處理中",
  shipped: "已出貨",
  delivered: "已送達",
  cancelled: "已取消",
  refunded: "已退款",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  pending: "outline",
  paid: "default",
  processing: "default",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
  refunded: "secondary",
};

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  home_delivery: "宅配到府",
  seven_eleven: "7-11 超商取貨",
  family_mart: "全家超商取貨",
};

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const shippingInfo =
    order.shippingMethod === "home_delivery"
      ? order.shippingAddress
      : `${order.shippingStoreName ?? ""} ${order.shippingStoreId ? `(${order.shippingStoreId})` : ""}`.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost" className="-ml-2">
          <Link href="/account/orders">
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回訂單列表
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-5">
        <div>
          <p className="text-xs text-muted-foreground">訂單編號</p>
          <p className="mt-0.5 font-mono font-semibold">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            下單時間：
            {new Date(order.createdAt).toLocaleString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Items */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">商品明細</h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
              </div>
              <div className="text-right">
                <p>NT$ {Number(item.unitPrice).toLocaleString()} × {Number(item.quantity)}</p>
                <p className="text-muted-foreground">
                  NT$ {Number(item.subtotal).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>小計</span>
            <span>NT$ {Number(order.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>運費</span>
            <span>
              {Number(order.shippingFee) === 0
                ? "免運"
                : `NT$ ${Number(order.shippingFee).toLocaleString()}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>總計</span>
            <span>NT$ {Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">收件資訊</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">姓名</dt>
              <dd>{order.recipientName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">手機</dt>
              <dd>{order.recipientPhone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">配送</dt>
              <dd>{SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}</dd>
            </div>
            {shippingInfo && (
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted-foreground">地址</dt>
                <dd>{shippingInfo}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">付款資訊</h2>
          <dl className="space-y-1.5 text-sm">
            {order.paymentMethod && (
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted-foreground">方式</dt>
                <dd>{order.paymentMethod}</dd>
              </div>
            )}
            {order.paidAt && (
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted-foreground">時間</dt>
                <dd>
                  {new Date(order.paidAt).toLocaleString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            )}
            {order.newebpayTradeNo && (
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted-foreground">交易序號</dt>
                <dd className="font-mono text-xs">{order.newebpayTradeNo}</dd>
              </div>
            )}
            {!order.paidAt && (
              <p className="text-muted-foreground">尚未付款</p>
            )}
          </dl>
        </div>
      </div>

      {order.note && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-2 font-semibold">訂單備註</h2>
          <p className="text-sm text-muted-foreground">{order.note}</p>
        </div>
      )}
    </div>
  );
}
