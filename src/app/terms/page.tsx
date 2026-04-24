import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "usage",
  "account",
  "order",
  "ip",
  "liability",
  "changes",
  "contact",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.terms");
  return { title: t("title") };
}

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");

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
