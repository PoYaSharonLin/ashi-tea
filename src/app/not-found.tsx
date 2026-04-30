import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl">🍵</div>
      <div>
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <h2 className="mt-3 text-xl font-medium">{t("notFound")}</h2>
        <p className="mt-2 text-muted-foreground">{t("notFoundDescription")}</p>
      </div>
      <Link
        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        href="/"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
