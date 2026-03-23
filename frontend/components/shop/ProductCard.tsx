"use client";

import { usePrefetchProduct } from "@/api/productQueries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useCartStore from "@/stores/useCartStore";
import useWishlistStore from "@/stores/useWishlistStore";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface ProductCardProps {
  product: any;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const prefetchProduct = usePrefetchProduct();

  const inWishlist = isInWishlist(product.id);
  const firstVariant = product.variants?.[0];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addItem(product, firstVariant || null, 1);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setTimeout(() => {
        setIsAdding(false);
      }, 1500);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleMouseEnter = () => {
    prefetchProduct(product.slug || product.id);
  };

  return (
    <div
      className="group relative bg-white transition-all duration-500"
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted mb-4">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Product Image */}
        <Link href={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={product.primary_image || product.images?.[0] || null}
            alt={product.name || product.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110",
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </Link>

        {/* Top Action Buttons - Floating on hover */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "p-2.5 bg-white shadow-sm hover:shadow-md transition-all duration-300",
              inWishlist ? "text-primary" : "text-foreground"
            )}
            style={{ borderRadius: 0 }}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </button>
        </div>

        {/* Badges */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-2 py-1 text-[10px] font-bold tracking-widest z-20">
            {discountPercent}% OFF
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30">
          <Button
            onClick={handleAddToCart}
            className="w-full h-11 text-xs font-bold tracking-widest bg-white text-black hover:bg-black hover:text-white border border-black/5"
            style={{ borderRadius: 0 }}
            disabled={isAdding || product.stock_quantity === 0}
          >
            {isAdding ? "ADDING..." : "QUICK ADD"}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <Link href={`/product/${product.slug || product.id}`} className="block group/title">
              <h3 className="text-sm font-medium text-foreground group-hover/title:text-muted-foreground transition-colors duration-300 truncate tracking-tight">
                {product.name || product.title}
              </h3>
            </Link>

            {/* Category / Sub-label */}
            {product.category && (
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground transition-all duration-300">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-foreground">
                  ${Number(product.sale_price).toFixed(2)}
                </span>
                <span className="text-[11px] text-muted-foreground line-through opacity-70">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-foreground">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;