import Link from "next/link";
import { Package } from "lucide-react";

import { getUserOrders } from "~/app/actions/orders";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";

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

export default async function OrdersPage() {
  const orders = await getUserOrders();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium">還沒有訂單</p>
          <p className="mt-1 text-sm text-muted-foreground">
            去選購台灣高山茶吧！
          </p>
        </div>
        <Button asChild>
          <Link href="/products">立即選購</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.orderNumber}`}
          className="block rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-base font-semibold">{order.orderNumber}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-base">
            <p className="text-muted-foreground">
              {order.items.length} 件商品
            </p>
            <p className="font-semibold">NT$ {Number(order.total).toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
