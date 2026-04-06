import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { SignOutPageClient } from "~/app/auth/sign-out/[[...signout]]/page.client";
import { getCurrentUserOrRedirect } from "~/lib/auth";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/ui/components/page-header";
import { Shell } from "~/ui/primitives/shell";

export const metadata: Metadata = {
  description: "Sign out of your account",
  metadataBase: new URL(
    process.env.NEXT_SERVER_APP_URL || "http://localhost:3000",
  ),
  title: "Sign out",
};

export default async function SignOutPage() {
  await getCurrentUserOrRedirect();

  const t = await getTranslations("auth.signOut");

  const translations = {
    title: t("title"),
    button: t("button"),
    cancel: t("cancel"),
  };

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading>{translations.title}</PageHeaderHeading>
      </PageHeader>
      <SignOutPageClient translations={translations} />
    </Shell>
  );
}
