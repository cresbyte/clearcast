"use client";

import React from 'react';
import { useProducts } from '@/api/productQueries';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface FeaturedFilterSectionProps {
    title: string;
    subtitle?: string;
    description?: string;
    filterSlug: string;
    filterName: string;
    badgeText?: string;
    buttonText?: string;
    buttonLink?: string;
    index: number;
}

const FeaturedFilterSection: React.FC<FeaturedFilterSectionProps> = ({
    title,
    subtitle,
    description,
    filterSlug,
    filterName,
    badgeText,
    buttonText,
    buttonLink,
    index
}) => {
    // Fetch products matching this filter
    const { data: productsData, isLoading } = useProducts({
        filters__slug: filterSlug,
        pageSize: 4
    });

    const products = productsData?.results || [];

    // If no products and loading is done, maybe don't show the section?
    // Or show a message. For landing page, we usually want to hide it if empty.
    if (!isLoading && products.length === 0) return null;

    const isEven = index % 2 === 0;

    return (
        <section className={`py-24 md:py-32 ${isEven ? 'bg-white' : 'bg-[#F9F9F7]'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Content Column */}
                    <div className="w-full lg:w-1/3 space-y-8 sticky top-24">
                        <div className="space-y-4">
                            {badgeText && (
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                    {badgeText}
                                </span>
                            )}
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight tracking-tighter">
                                {title}
                            </h2>
                            {subtitle && (
                                <h3 className="text-lg font-medium text-muted-foreground/80 lowercase italic font-serif tracking-tight">
                                    {subtitle}
                                </h3>
                            )}
                        </div>

                        <p className="text-[15px] text-muted-foreground/80 leading-loose max-w-sm">
                            {description}
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link href={`/fly-bars?filter=${filterSlug}`}>
                                <Button className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all duration-500 shadow-sm">
                                    {buttonText || `Shop ${filterName}`}
                                </Button>
                            </Link>
                            {buttonLink && buttonLink !== `/fly-bars?filter=${filterSlug}` && (
                                <Link href={buttonLink}>
                                    <Button variant="outline" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-white transition-all duration-500">
                                        Learn More
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Product Grid Column */}
                    <div className="w-full lg:w-2/3">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-4 animate-pulse">
                                        <div className="aspect-[4/5] bg-muted rounded-none" />
                                        <div className="h-4 w-2/3 bg-muted" />
                                        <div className="h-4 w-1/3 bg-muted" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
                                {products?.slice(0, 4).map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {products.length === 0 && !isLoading && (
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-none italic text-muted-foreground">
                                No products found for this collection.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedFilterSection;
