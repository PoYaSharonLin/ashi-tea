import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";
import { CheckoutForm } from "./_components/checkout-form";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/checkout");
  }

  return (
    <div className="container px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold">結帳</h1>
      <CheckoutForm
        userEmail={session.user.email}
        userName={session.user.name ?? ""}
      />
    </div>
  );
}
