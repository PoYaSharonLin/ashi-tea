import { ArrowRight, Clock, Gift, Leaf, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getFeaturedProducts } from "~/app/actions/products";
import { ProductCard } from "~/ui/components/product-card";
import { TestimonialsSection } from "~/ui/components/testimonials/testimonials-with-marquee";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";

import { categories, testimonials } from "./mocks";

const featuresWhyChooseUs = [
  {
    description: "嚴選台灣各大茶區高山茶葉，產地直送，品質有保障。",
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: "嚴選產地",
  },
  {
    description: "訂單滿 NT$1,200 免運費，低溫保鮮配送，確保茶葉新鮮到府。",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "滿額免運",
  },
  {
    description: "提供精美禮盒包裝，適合節慶送禮、企業伴手禮，附贈提袋。",
    icon: <Gift className="h-6 w-6 text-primary" />,
    title: "精美禮盒",
  },
  {
    description: "堅持品質，不滿意可退換，讓您安心選購每一款好茶。",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "品質保證",
  },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="bg-grid-black/[0.02] absolute inset-0 bg-[length:20px_20px]" />
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  台灣嚴選高山好茶
                </span>
                <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
                  品味台灣，
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    一葉知秋
                  </span>
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  阿詩茶嚴選台灣阿里山、東方美人、日月潭等知名茶區，
                  從產地直達您的茶桌，讓每一口都是台灣的味道。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button className="h-12 gap-1.5 px-8 transition-colors duration-200" size="lg">
                    選購茶品 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products?category=gift_box">
                  <Button className="h-12 px-8 transition-colors duration-200" size="lg" variant="outline">
                    禮盒專區
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-5 w-5 text-primary/70" />
                  <span>滿 NT$1,200 免運</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-5 w-5 text-primary/70" />
                  <span>3–5 個工作日到貨</span>
                </div>
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-square w-full max-w-md overflow-hidden rounded-xl border shadow-lg lg:block">
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
              <Image
                alt="台灣高山茶"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1200px) 50vw, 33vw"
                src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Shop by Category */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              依類別選購
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              散茶、茶包、禮盒，找到最適合您的茶品
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {categories.map((category) => (
              <Link
                aria-label={`瀏覽${category.name}`}
                className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg"
                href={`/products?category=${category.slug}`}
                key={category.slug}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                  <Image
                    alt={category.name}
                    className="object-cover transition duration-300 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={category.image}
                  />
                </div>
                <div className="relative z-20 -mt-6 p-4">
                  <div className="mb-0.5 text-lg font-medium">{category.name}</div>
                  <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              精選茶品
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              嚴選台灣各大茶區代表性茶款，品質有保障
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              精選商品即將上架，敬請期待。
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => {
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

          <div className="mt-10 flex justify-center">
            <Link href="/products">
              <Button className="group h-12 px-8" size="lg" variant="outline">
                查看所有茶品
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16" id="features">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              為什麼選擇阿詩茶
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuresWhyChooseUs.map((feature) => (
              <Card
                className="rounded-2xl border-none bg-background shadow transition-all duration-300 hover:shadow-lg"
                key={feature.title}
              >
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TestimonialsSection
            className="py-0"
            description="來自台灣與世界各地茶友的真實分享"
            testimonials={testimonials}
            title="茶友心聲"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg md:p-12">
            <div className="bg-grid-white/[0.05] absolute inset-0 bg-[length:16px_16px]" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                開始您的台灣茶之旅
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                立即選購嚴選台灣高山茶葉，或挑選精美禮盒送給重要的人。
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/products">
                  <Button className="h-12 px-8 transition-colors duration-200" size="lg">
                    立即選購
                  </Button>
                </Link>
                <Link href="/products?category=gift_box">
                  <Button className="h-12 px-8 transition-colors duration-200" size="lg" variant="outline">
                    禮盒專區
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
