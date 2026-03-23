"use client";

import React, { useRef, useMemo } from 'react';
import { useProducts } from '@/api/productQueries';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedProductsProps {
    currentProduct: any;
}

const RelatedProducts = ({ currentProduct }: RelatedProductsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const categorySlug = currentProduct?.category?.slug;

    // Fetch products in the same category
    const { data: categoryData, isLoading } = useProducts({
        categories: categorySlug ? [categorySlug] : [],
        page: 1
    });

    // Creative fallback fetching: get general products if category is thin
    const { data: fallbackData } = useProducts({
        sortBy: 'newest',
        page: 1
    });

    const relatedProducts = useMemo(() => {
        let list = [...(categoryData?.results || [])];

        // Exclude current product
        list = list.filter((p: any) => p.id !== currentProduct.id);

        // If we have less than 4, add from fallback
        if (list.length < 4) {
            const fallbackList = (fallbackData?.results || [])
                .filter((p: any) => p.id !== currentProduct.id && !list.some((item: any) => item.id === p.id));
            list = [...list, ...fallbackList];
        }

        // Shuffle slightly and limit to 8
        return list.slice(0, 8);
    }, [categoryData, fallbackData, currentProduct.id]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (isLoading) return (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40 mb-4" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Finding Matches</p>
        </div>
    );

    if (relatedProducts.length === 0) return null;

    return (
        <section className="py-32 border-t border-border/40 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-16 px-2">
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Recommendations</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter">You Might Also Like</h2>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="h-12 w-12 rounded-none border-border/60 hover:border-foreground transition-all duration-300 group"
                        >
                            <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="h-12 w-12 rounded-none border-border/60 hover:border-foreground transition-all duration-300 group"
                        >
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {relatedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedProducts;
