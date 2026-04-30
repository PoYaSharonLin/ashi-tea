import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProductById } from "~/app/actions/products";
import { SEO_CONFIG } from "~/app";
import { Separator } from "~/ui/primitives/separator";
import { AddToCartForm } from "../_components/add-to-cart-form";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return { title: `商品不存在 | ${SEO_CONFIG.fullName}` };
  }
  return {
    title: `${product.name} | ${SEO_CONFIG.fullName}`,
    description: product.description?.slice(0, 160) ?? `${product.name} — ${SEO_CONFIG.description}`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [product, t] = await Promise.all([
    getProductById(id),
    getTranslations("products"),
  ]);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images?.[0] ?? "";
  const cheapestVariant = product.variants
    .filter((v) => v.isActive)
    .sort((a, b) => Number(a.price) - Number(b.price))[0];

  const discountPercentage =
    cheapestVariant?.compareAtPrice
      ? Math.round(
          ((Number(cheapestVariant.compareAtPrice) - Number(cheapestVariant.price)) /
            Number(cheapestVariant.compareAtPrice)) *
            100,
        )
      : 0;

  const cartFormLabels = {
    selectVariant: t("selectVariant"),
    variants: t("variants"),
    quantity: t("quantity"),
    addToCart: t("addToCart"),
    outOfStock: "售完",
    inStock: "現貨供應",
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            href="/products"
          >
            ← {t("title")}
          </Link>

          {/* Main grid */}
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {primaryImage ? (
                <Image
                  alt={product.name}
                  className="object-cover"
                  fill
                  priority
                  src={primaryImage}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  無圖片
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.nameEn && (
                  <p className="mt-1 text-lg text-muted-foreground">{product.nameEn}</p>
                )}
              </div>

              {/* Add to cart form (client component — includes reactive price) */}
              <AddToCartForm
                labels={cartFormLabels}
                productCategory={product.category}
                productId={product.id}
                productImage={primaryImage}
                productName={product.name}
                variants={product.variants}
              />

              <Separator className="my-6" />

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">{t("description")}</h2>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}

              {/* Shipping info */}
              <div className="mt-4 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium">{t("shipping")}</p>
                <p className="mt-1">{t("shippingInfo")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
