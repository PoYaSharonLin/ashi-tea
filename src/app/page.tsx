import { Gift, Leaf, Mountain, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";


const featuresWhyChooseUs = [
  {
    description: "嚴選六龜茶區一心二葉，產地直送，品質有保障。",
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: "嚴選產地",
  },
  {
    description: "訂單滿 NT$1,200 免運費，3至5日配送到府。",
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

export default function HomePage() {
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
                <div className="max-w-[600px] space-y-3 text-muted-foreground">
                  <p className="text-base font-medium text-foreground/80">熹茶 | Ashi – Tea</p>
                  <p className="text-base leading-relaxed md:text-lg">
                    「熹」者，晨光初露之溫潤也；茶者，承天地之氣、蘊歲月之香。熹茶之名，取其一縷光、一盞茶之間，映照人心之靜與喜。於煮水聽松風、觀湯候沸之際，萬念歸一；於溫杯潤盞、投茶醒葉之間，茶性漸舒，香氣初展。此乃茶道之始，亦為心境之開。
                  </p>
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
                src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* 山嵐茶園 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              <Image
                alt="六龜山嵐茶園"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="https://plus.unsplash.com/premium_photo-1692049123825-8d43174c9c5c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
            <div className="flex flex-col space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium tracking-widest text-primary uppercase">Origin</span>
                </div>
                <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                  山嵐茶園
                </h2>
                <div className="h-1 w-12 rounded-full bg-primary" />
              </div>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  在南境山嵐深處，隱於遠山層疊之間的六龜茶園，如一方未被塵世驚擾的秘境。晨霧沿著山脊緩緩流動，雲影低垂，茶樹在濕潤與光影之間靜靜生長，汲取天地最純粹的氣息。高海拔的氣候，使晝夜溫差分明，生長緩慢而細緻，將山林的清氣凝鍊於一葉之中。
                </p>
                <p>
                  這裡的茶，帶著山風的輕柔與泉水的甘冽，入口清甜而澄澈，如初醒的晨光灑落心間。其香不張揚，卻悠遠綿長；其味不濃烈，卻層次深藏。每一口，皆是遠山的回聲，是雲霧與時間共同釀成的靜謐之味。
                </p>
                <p>
                  六龜之茶，不僅生於高處，更自有其清明與純淨——彷彿將人引入那片遠離喧囂的山中秘境，於一盞之間，得見天地之廣與心境之清。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16" id="features">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              為什麼選擇熹茶
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
