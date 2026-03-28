"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Billing page replaced by order history in the account section.
// Redirect to dashboard for now.
export function BillingPageClient() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
