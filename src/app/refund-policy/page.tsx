import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "eligibility",
  "process",
  "refundMethod",
  "exchange",
  "exceptions",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.refund");
  return { title: t("title") };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations("legal.refund");

  const sections = SECTION_KEYS.map((key) => ({
    title: t(`sections.${key}.title`),
    content: t(`sections.${key}.content`),
  }));

  return (
    <LegalPage
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      intro={t("intro")}
      sections={sections}
    />
  );
}
