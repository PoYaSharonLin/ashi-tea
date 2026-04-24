import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "preparation",
  "dosage",
  "water",
  "steeping",
  "tasting",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.teaBrewing");
  return { title: t("title") };
}

export default async function TeaBrewingPage() {
  const t = await getTranslations("legal.teaBrewing");

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
      heroImage={{
        src: "/tea-brewing-steps.png",
        alt: t("title"),
      }}
    />
  );
}
