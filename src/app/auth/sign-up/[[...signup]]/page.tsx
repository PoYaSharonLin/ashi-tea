import { getTranslations } from "next-intl/server";

import { SYSTEM_CONFIG } from "~/app";
import { getCurrentUserOrRedirect } from "~/lib/auth";

import { SignUpPageClient } from "./page.client";

export default async function SignUpPage() {
  await getCurrentUserOrRedirect(
    undefined,
    SYSTEM_CONFIG.redirectAfterSignIn,
    true,
  );

  const t = await getTranslations("auth.signUp");

  const translations = {
    title: t("title"),
    subtitle: t("subtitle"),
    name: t("name"),
    namePlaceholder: t("namePlaceholder"),
    email: t("email"),
    emailPlaceholder: t("emailPlaceholder"),
    password: t("password"),
    signUpButton: t("signUpButton"),
    creatingAccount: t("creatingAccount"),
    hasAccount: t("hasAccount"),
    signInLink: t("signInLink"),
    orContinueWith: t("orContinueWith"),
    googleSignUp: t("googleSignUp"),
    errorRegistration: t("errorRegistration"),
    errorGoogle: t("errorGoogle"),
  };

  return <SignUpPageClient translations={translations} />;
}
