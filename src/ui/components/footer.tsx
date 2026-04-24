import { Facebook, Instagram, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { SEO_CONFIG } from "~/app";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";

export async function Footer({ className }: { className?: string }) {
  const t = await getTranslations("footer");

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                {SEO_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{t("taxId", { id: "60151701" })}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <a
                  className="hover:text-foreground"
                  href="mailto:support@ashi-tea.store"
                >
                  support@ashi-tea.store
                </a>
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("shopTitle")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/products"
                >
                  {t("links.products")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/cart"
                >
                  {t("links.cart")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/account"
                >
                  {t("links.account")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tea Guide */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              {t("teaGuide.title")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/tea-storage"
                >
                  {t("links.teaStorage")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/tea-brewing"
                >
                  {t("links.teaBrewing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              {t("supportTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/shipping-info"
                >
                  {t("links.shippingInfo")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/refund-policy"
                >
                  {t("links.refundPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/terms"
                >
                  {t("links.terms")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/privacy"
                >
                  {t("links.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href="/privacy">
                {t("links.privacy")}
              </Link>
              <Link className="hover:text-foreground" href="/terms">
                {t("links.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
