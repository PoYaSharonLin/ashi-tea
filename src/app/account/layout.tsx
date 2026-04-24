import { getCurrentUserOrRedirect } from "~/lib/auth";

import { AccountNav } from "./_components/account-nav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserOrRedirect();

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">我的帳戶</h1>
          <p className="mt-1 text-base text-muted-foreground">{user?.email}</p>
        </div>
        <AccountNav />
        {children}
      </div>
    </div>
  );
}
