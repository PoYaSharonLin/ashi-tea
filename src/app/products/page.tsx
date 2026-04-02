import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { getProducts } from "~/app/actions/products";
import { ProductCard } from "~/ui/components/product-card";
import { ProductsFilter } from "./_components/products-filter";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const [t, products] = await Promise.all([
    getTranslations("products"),
    getProducts(category),
  ]);

  const filterLabels = {
    all: t("filter.all"),
    looseLeaf: t("filter.looseLeaf"),
    giftBox: t("filter.giftBox"),
    teaBag: t("filter.teaBag"),
    accessory: t("filter.accessory"),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-10">
        <div className="container px-4 md:px-6">
          {/* Heading & filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            </div>
            <Suspense>
              <ProductsFilter labels={filterLabels} />
            </Suspense>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">{t("noProducts")}</p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
}
