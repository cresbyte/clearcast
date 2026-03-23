"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import useCartStore from "@/stores/useCartStore";
import OrderSummary from "@/components/shop/OrderSummary";

const Cart = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShipping,
    getTotal,
    fetchCart,
    loading,
  } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Loading Shopping Bag</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="space-y-12">
                <div className="flex items-end justify-between border-b border-border/40 pb-8">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Your Selection</span>
                    <h1 className="text-5xl font-serif font-bold tracking-tighter">Shopping Bag</h1>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
                </div>

                <div className="divide-y divide-border/40">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className="group flex gap-8 py-10 first:pt-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.handle}`}
                        className="h-32 w-32 sm:h-48 sm:w-48 flex-shrink-0 overflow-hidden bg-[#F9F9F7]"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <Link
                                href={`/product/${item.handle}`}
                                className="block"
                              >
                                <h3 className="text-lg font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                              </Link>

                              {/* Variant Info */}
                              {item.variantName && (
                                <div className="flex flex-wrap gap-4 pt-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/40">Variant:</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.variantName}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className="text-lg font-serif font-bold text-foreground">
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center gap-8 pt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-border/60 h-10 w-32">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-10 h-full flex items-center justify-center hover:bg-[#F9F9F7] transition-colors disabled:opacity-20"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <div className="flex-1 h-full flex items-center justify-center text-[11px] font-black border-x border-border/60">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-full flex items-center justify-center hover:bg-[#F9F9F7] transition-colors disabled:opacity-20"
                                disabled={item.quantity >= (item.stockLimit || 99)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-destructive transition-colors border-b border-transparent hover:border-destructive pb-0.5"
                            >
                              Relinquish
                            </button>
                          </div>

                          {item.quantity >= item.stockLimit && (
                            <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest pt-2">
                              Maximum Allocation Reached
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping Link */}
                <div className="pt-12 border-t border-border/40">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-all pb-1 border-b border-transparent hover:border-primary"
                  >
                    <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> Return to Curatels
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 lg:pl-8">
              <OrderSummary
                actionLabel="Complete Acquisition"
                onAction={handleCheckout}
                showTrustBadges={true}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12">
            <div className="space-y-6 max-w-lg">
              <div className="flex justify-center">
                <div className="h-32 w-32 bg-[#F9F9F7] flex items-center justify-center relative">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                  <div className="absolute inset-0 border border-border/40 scale-110" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold tracking-tight text-foreground">Bag is Unoccupied</h2>
                <p className="text-muted-foreground text-sm leading-relaxed font-serif italic">
                  "Style is a way to say who you are <br />without having to speak."
                </p>
              </div>
            </div>

            <Link href="/shop">
              <Button size="lg" className="h-14 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-none hover:translate-y-[-2px] transition-all duration-500 shadow-xl shadow-primary/10">
                Begin Curation
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
