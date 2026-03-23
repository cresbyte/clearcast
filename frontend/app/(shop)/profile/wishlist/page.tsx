"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useWishlistStore from "@/stores/useWishlistStore";
import useCartStore from "@/stores/useCartStore";

export default function Wishlist() {
    const { items, removeItem, getItemsSorted, fetchWishlist, loading } =
        useWishlistStore();
    const addItem = useCartStore((state) => state.addItem);
    const [movingId, setMovingId] = React.useState<number | null>(null);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const wishlistItems = getItemsSorted();

    const handleAddToCart = async (wishlistItem: any) => {
        setMovingId(wishlistItem.id);
        try {
            // Use the stored product data or fallback to a minimal product object
            const product = wishlistItem.rawProduct || {
                id: wishlistItem.id,
                name: wishlistItem.title,
                base_price: wishlistItem.price,
                slug: wishlistItem.handle,
                primary_image: wishlistItem.image,
                category: { name: wishlistItem.category },
                variants: []
            };

            const variant = product.variants?.[0] || null;

            // addItem is usually async if it calls the backend
            await addItem(product, variant, 1);
            // removeItem call removed as per user request to keep it in wishlist
        } catch (error) {
            console.error('Failed to add item to cart:', error);
        } finally {
            setMovingId(null);
        }
    };

    if (loading && wishlistItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">
                    My Wishlist
                </h1>
                <p className="text-muted-foreground">
                    Items you've saved for later. ({wishlistItems.length})
                </p>
            </div>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {wishlistItems.map((item: any) => (
                        <div
                            key={item.id}
                            className="flex gap-4 p-4 border bg-card transition-shadow"
                        >
                            <div className="h-32 w-32 flex-shrink-0 overflow-hidden bg-muted rounded">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <Link href={`/product/${item.handle}`}>
                                        <h3 className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {typeof item.category === "object"
                                            ? item.category?.name
                                            : item.category}{" "}
                                        •{" "}
                                        {typeof item.subcategory === "object"
                                            ? item.subcategory?.name
                                            : item.subcategory}
                                    </p>
                                    <div className="mt-2">
                                        {item.compareAtPrice &&
                                            Number(item.compareAtPrice) > Number(item.price) ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-muted-foreground line-through text-sm">
                                                    ${Number(item.compareAtPrice).toFixed(2)}
                                                </p>
                                                <p className="text-destructive font-semibold text-lg">
                                                    ${Number(item.price).toFixed(2)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-foreground font-semibold text-lg">
                                                ${Number(item.price).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <Button
                                        onClick={() => handleAddToCart(item)}
                                        size="sm"
                                        disabled={movingId === item.id}
                                        className="rounded-none"
                                    >
                                        {movingId === item.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                        )}
                                        {movingId === item.id ? "Adding..." : "Add to Cart"}
                                    </Button>
                                    <Button
                                        onClick={() => removeItem(item.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive rounded-none"
                                        disabled={movingId === item.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 space-y-6">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                            <Heart className="h-12 w-12 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-lg font-medium">
                            Your wishlist is empty.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Save items you love for later by clicking the heart icon.
                        </p>
                    </div>
                    <Link href="/shop">
                        <Button size="lg" className="rounded-none">Discover Products</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
