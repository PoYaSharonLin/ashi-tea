"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "~/lib/cn";
import { useCart } from "~/lib/hooks/use-cart";
import { useMediaQuery } from "~/lib/hooks/use-media-query";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "~/ui/primitives/drawer";
import { Separator } from "~/ui/primitives/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/primitives/sheet";

interface CartClientProps {
  className?: string;
}

export function CartClient({ className }: CartClientProps) {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const CartTrigger = (
    <Button
      aria-label="Open cart"
      className="relative h-9 w-9 rounded-full"
      size="icon"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
          variant="default"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );

  const CartContent = (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <div className="text-xl font-semibold">購物車</div>
          <div className="text-sm text-muted-foreground">
            {itemCount === 0
              ? "您的購物車是空的"
              : `共 ${itemCount} 件商品`}
          </div>
        </div>
        {isDesktop && (
          <SheetClose asChild>
            <Button size="icon" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">購物車是空的</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                快去選購您喜愛的茶品吧！
              </p>
              {isDesktop ? (
                <SheetClose asChild>
                  <Link href="/products">
                    <Button>瀏覽茶品</Button>
                  </Link>
                </SheetClose>
              ) : (
                <DrawerClose asChild>
                  <Link href="/products">
                    <Button>瀏覽茶品</Button>
                  </Link>
                </DrawerClose>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex rounded-lg border bg-card p-2 shadow-sm transition-colors hover:bg-accent/50"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={item.id}
                  layout
                  transition={{ duration: 0.15 }}
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded">
                    {item.image && (
                      <Image
                        alt={item.name}
                        className="object-cover"
                        fill
                        src={item.image}
                      />
                    )}
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="line-clamp-2 text-sm font-medium">
                          {item.name}
                        </span>
                        <button
                          className="-mt-1 -mr-1 ml-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">移除</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border">
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-l-md border-r text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          type="button"
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">減少</span>
                        </button>
                        <span className="flex h-7 w-7 items-center justify-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-r-md border-l text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          type="button"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">增加</span>
                        </button>
                      </div>
                      <div className="text-sm font-medium">
                        NT$ {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <div className="border-t px-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">小計</span>
              <span className="font-medium">NT$ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">運費</span>
              <span className="font-medium">結帳時計算</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">合計</span>
              <span className="text-base font-semibold">NT$ {subtotal.toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full" size="lg">
                前往結帳
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              {isDesktop ? (
                <SheetClose asChild>
                  <Link href="/cart">
                    <Button variant="outline">查看購物車</Button>
                  </Link>
                </SheetClose>
              ) : (
                <DrawerClose asChild>
                  <Link href="/cart">
                    <Button variant="outline">查看購物車</Button>
                  </Link>
                </DrawerClose>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMounted) {
    return (
      <div className={cn("relative", className)}>
        <Button
          aria-label="Open cart"
          className="relative h-9 w-9 rounded-full"
          size="icon"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isDesktop ? (
        <Sheet onOpenChange={setIsOpen} open={isOpen}>
          <SheetTrigger asChild>{CartTrigger}</SheetTrigger>
          <SheetContent className="flex w-[400px] flex-col p-0">
            <SheetHeader>
              <SheetTitle>購物車</SheetTitle>
            </SheetHeader>
            {CartContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer onOpenChange={setIsOpen} open={isOpen}>
          <DrawerTrigger asChild>{CartTrigger}</DrawerTrigger>
          <DrawerContent>{CartContent}</DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
