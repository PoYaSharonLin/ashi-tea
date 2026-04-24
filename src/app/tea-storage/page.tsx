import { getTranslations } from "next-intl/server";

import { LegalPage } from "~/ui/components/legal-page";

const SECTION_KEYS = [
  "environment",
  "sealing",
  "avoidOdor",
  "bestBefore",
] as const;

export async function generateMetadata() {
  const t = await getTranslations("legal.teaStorage");
  return { title: t("title") };
}

export default async function TeaStoragePage() {
  const t = await getTranslations("legal.teaStorage");

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
        src: "/tea-storage-guide.png",
        alt: t("title"),
      }}
    />
  );
}
