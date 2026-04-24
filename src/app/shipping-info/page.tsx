import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "processing",
  "methods",
  "fees",
  "tracking",
  "notes",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.shipping");
  return { title: t("title") };
}

export default async function ShippingInfoPage() {
  const t = await getTranslations("legal.shipping");

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
