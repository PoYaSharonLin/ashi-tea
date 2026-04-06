import { CheckoutForm } from "./_components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold">結帳</h1>
          <CheckoutForm />
        </div>
      </main>
    </div>
  );
}
