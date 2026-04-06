import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { getProducts } from "~/app/actions/products";
import { ProductCard } from "~/ui/components/product-card";
import { ProductsFilter } from "./_components/products-filter";
import ProductsLoading from "./loading";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

async function ProductsGrid({ category }: { category?: string }) {
  const [t, products] = await Promise.all([
    getTranslations("products"),
    getProducts(category),
  ]);

  if (products.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">{t("noProducts")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const cheapestVariant = product.variants
          .filter((v) => v.isActive)
          .sort((a, b) => Number(a.price) - Number(b.price))[0];

        return (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              category: product.category,
              image: product.images?.[0] ?? "",
              price: Number(cheapestVariant?.price ?? 0),
              originalPrice: cheapestVariant?.compareAtPrice
                ? Number(cheapestVariant.compareAtPrice)
                : undefined,
              inStock: product.variants.some((v) => v.stock > 0),
            }}
          />
        );
      })}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const t = await getTranslations("products");

  const filterLabels = {
    all: t("filter.all"),
    looseLeaf: t("filter.looseLeaf"),
    teaBrick: t("filter.teaBrick"),
    mixedGiftBox: t("filter.mixedGiftBox"),
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading & filters */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <Suspense>
              <ProductsFilter labels={filterLabels} />
            </Suspense>
          </div>

          {/* Product grid — streams in with loading fallback */}
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid category={category} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <div className="aspect-square w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
