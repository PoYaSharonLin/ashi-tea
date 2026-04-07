"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import type { ProductVariant } from "~/db/schema";
import { useCart } from "~/lib/hooks/use-cart";
import { Button } from "~/ui/primitives/button";

interface AddToCartFormProps {
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  variants: ProductVariant[];
  labels: {
    selectVariant: string;
    variants: string;
    quantity: string;
    addToCart: string;
    outOfStock: string;
    inStock: string;
  };
}

export function AddToCartForm({
  productId,
  productName,
  productImage,
  productCategory,
  variants,
  labels,
}: AddToCartFormProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const compareAtPrice = selectedVariant?.compareAtPrice ? Number(selectedVariant.compareAtPrice) : null;

  const handleAddToCart = React.useCallback(async () => {
    if (!selectedVariant) return;
    setIsAdding(true);

    addItem(
      {
        id: `${productId}-${selectedVariant.id}`,
        productId,
        variantId: selectedVariant.id,
        name: `${productName}${selectedVariant.name ? ` - ${selectedVariant.name}` : ""}`,
        image: productImage,
        category: productCategory,
        price: Number(selectedVariant.price),
      },
      quantity,
    );

    toast.success(`${productName} 已加入購物車`);
    setQuantity(1);
    await new Promise((r) => setTimeout(r, 400));
    setIsAdding(false);
  }, [addItem, productId, productName, productImage, productCategory, selectedVariant, quantity]);

  if (variants.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.outOfStock}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Price — updates with selected variant */}
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold">
          NT$ {price.toLocaleString()}
        </span>
        {compareAtPrice && (
          <span className="text-xl text-muted-foreground line-through">
            NT$ {compareAtPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Variant selector */}
      <div>
        <p className="mb-2 text-sm font-medium">{labels.variants}</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                v.id === selectedVariantId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              } ${v.stock <= 0 ? "cursor-not-allowed opacity-40" : ""}`}
              disabled={v.stock <= 0}
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              type="button"
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stock status */}
      <p
        aria-live="polite"
        className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}
      >
        {inStock ? labels.inStock : labels.outOfStock}
      </p>

      {/* Quantity + Add to cart */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center">
          <Button
            aria-label="減少數量"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            size="icon"
            variant="outline"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center select-none">{quantity}</span>
          <Button
            aria-label="增加數量"
            onClick={() => setQuantity((q) => q + 1)}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="flex-1"
          disabled={!inStock || isAdding}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? "加入中…" : labels.addToCart}
        </Button>
      </div>
    </div>
  );
}
