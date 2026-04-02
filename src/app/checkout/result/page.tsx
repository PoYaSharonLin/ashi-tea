import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Button } from "~/ui/primitives/button";

interface ResultPageProps {
  searchParams: Promise<{ status?: string; order?: string }>;
}

export default async function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const { status, order } = await searchParams;

  if (status === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold">付款成功！</h1>
          {order && (
            <p className="mt-2 text-muted-foreground">
              訂單編號：<span className="font-mono font-semibold">{order}</span>
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            感謝您的購買，我們將盡快為您處理訂單。
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/products">繼續購物</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <XCircle className="h-16 w-16 text-destructive" />
        <div>
          <h1 className="text-2xl font-bold">付款失敗</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            付款未完成，您的訂單已保留，請重新嘗試。
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/checkout">返回結帳</Link>
        </Button>
      </div>
    );
  }

  // error or unknown
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertCircle className="h-16 w-16 text-yellow-500" />
      <div>
        <h1 className="text-2xl font-bold">發生錯誤</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          付款驗證失敗，請聯絡客服。
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">回首頁</Link>
      </Button>
    </div>
  );
}
