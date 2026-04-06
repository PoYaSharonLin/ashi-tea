import { Skeleton } from "~/ui/primitives/skeleton";
import { Separator } from "~/ui/primitives/separator";

export default function ProductDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Skeleton className="mb-6 h-4 w-24" />

          {/* Main grid */}
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product image */}
            <Skeleton className="aspect-square w-full rounded-lg" />

            {/* Product info */}
            <div className="flex flex-col">
              <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              {/* Price */}
              <Skeleton className="mb-4 h-8 w-32" />

              {/* Variant selector */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20 rounded-md" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                </div>
              </div>

              {/* Quantity + add to cart */}
              <div className="flex gap-3">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              {/* Shipping info */}
              <Skeleton className="mt-4 h-16 w-full rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
