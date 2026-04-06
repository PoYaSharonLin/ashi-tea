import { getTranslations } from "next-intl/server";

import { SYSTEM_CONFIG } from "~/app";
import { getCurrentUserOrRedirect } from "~/lib/auth";

import { SignInPageClient } from "./page.client";

export default async function SignInPage() {
  await getCurrentUserOrRedirect(
    undefined,
    SYSTEM_CONFIG.redirectAfterSignIn,
    true,
  );

  const t = await getTranslations("auth.signIn");

  const translations = {
    title: t("title"),
    subtitle: t("subtitle"),
    email: t("email"),
    password: t("password"),
    forgotPassword: t("forgotPassword"),
    signInButton: t("signInButton"),
    signingIn: t("signingIn"),
    noAccount: t("noAccount"),
    signUpLink: t("signUpLink"),
    orContinueWith: t("orContinueWith"),
    googleSignIn: t("googleSignIn"),
    errorInvalidCredentials: t("errorInvalidCredentials"),
    errorGoogle: t("errorGoogle"),
  };

  return <SignInPageClient translations={translations} />;
}
