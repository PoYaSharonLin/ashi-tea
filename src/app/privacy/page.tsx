import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "collection",
  "usage",
  "cookies",
  "security",
  "rights",
  "changes",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.privacy");
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy");

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
