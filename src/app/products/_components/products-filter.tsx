"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "~/ui/primitives/button";

interface ProductsFilterProps {
  labels: {
    all: string;
    looseLeaf: string;
    teaBrick: string;
    mixedGiftBox: string;
  };
}

const CATEGORIES = [
  { key: "all", label: (l: ProductsFilterProps["labels"]) => l.all },
  { key: "loose_leaf", label: (l: ProductsFilterProps["labels"]) => l.looseLeaf },
  { key: "tea_brick", label: (l: ProductsFilterProps["labels"]) => l.teaBrick },
  { key: "mixed_gift_box", label: (l: ProductsFilterProps["labels"]) => l.mixedGiftBox },
] as const;

export function ProductsFilter({ labels }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "all";

  const handleSelect = React.useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "all") {
        params.delete("category");
      } else {
        params.set("category", key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ key, label }) => (
        <Button
          aria-pressed={key === current}
          className="rounded-full"
          key={key}
          onClick={() => handleSelect(key)}
          size="sm"
          variant={key === current ? "default" : "outline"}
        >
          {label(labels)}
        </Button>
      ))}
    </div>
  );
}
