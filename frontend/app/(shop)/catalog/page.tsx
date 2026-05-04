"use client";

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/api/productQueries';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronRight, Globe, Filter } from 'lucide-react';
import countryList from 'country-list';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CatalogPage() {
    const majorCountries = [
        "United States",
        "Canada",
        "United Kingdom",
        "Australia",
        "New Zealand"
    ];
    
    const allNames = countryList.getNames();
    const otherCountries = allNames.filter(c => !majorCountries.includes(c)).sort();

    const [selectedCountry, setSelectedCountry] = useState<string>('All');

    // Requesting 1000 items to essentially bypass visible pagination
    const { data, isLoading, error } = useProducts({
        is_in_catalog: true,
        catalog_country: selectedCountry,
        pageSize: 1000,
    });

    const products = data?.results || [];

    // Group products by their primary filter (Fly Type)
    const groupedProducts = useMemo(() => {
        const groups: Record<string, any[]> = {};
        
        products.forEach((product: any) => {
            // Find a filter that looks like a fly type (exclude Season, Species, Water Type)
            const flyTypeFilter = product.filters?.find((f: any) => 
                !['Season', 'Species', 'Water Type'].includes(f.group_name)
            ) || product.filters?.[0];

            const groupName = flyTypeFilter?.name || 'Other Patterns';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(product);
        });

        // Return sorted group names
        return Object.keys(groups).sort().reduce((acc: any, key) => {
            acc[key] = groups[key];
            return acc;
        }, {});
    }, [products]);

    const groupNames = Object.keys(groupedProducts);

    return (
        <div className="min-h-screen bg-[#FDFDFB] pt-20 md:pt-28 pb-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                
                {/* Compact Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">
                                Pattern Catalog
                            </h1>
                            <p className="text-muted-foreground text-xs mt-1 max-w-xl">
                                Detailed technical specifications for our international distribution network. 
                                Select a destination to filter regional availability.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 mr-2">Quick Filter</span>
                            <button 
                                onClick={() => setSelectedCountry('All')}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all",
                                    selectedCountry === 'All' 
                                        ? "bg-foreground text-white border-foreground" 
                                        : "bg-white text-foreground border-border/60 hover:border-foreground"
                                )}
                            >
                                All
                            </button>
                            {majorCountries.map(country => (
                                <button 
                                    key={country}
                                    onClick={() => setSelectedCountry(country)}
                                    className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all hidden sm:block",
                                        selectedCountry === country 
                                            ? "bg-foreground text-white border-foreground" 
                                            : "bg-white text-foreground border-border/60 hover:border-foreground"
                                    )}
                                >
                                    {country}
                                </button>
                            ))}
                            
                            <div className="w-40 sm:w-48">
                                <Select value={majorCountries.includes(selectedCountry) || selectedCountry === 'All' ? "" : selectedCountry} onValueChange={(val) => setSelectedCountry(val || 'All')}>
                                    <SelectTrigger className="h-[34px] rounded-none text-[10px] font-bold uppercase tracking-widest bg-white border-border/60">
                                        <SelectValue placeholder="MORE DESTINATIONS" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none max-h-80">
                                        {otherCountries.map(country => (
                                            <SelectItem key={country} value={country} className="text-xs">
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mb-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Synching Data...</p>
                    </div>
                ) : error ? (
                    <div className="py-24 text-center border border-dashed border-destructive/30 bg-destructive/5 text-destructive">
                        <p className="text-xs font-bold">Error loading catalog. Please try again later.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center border bg-muted/5">
                        <Globe className="w-8 h-8 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-serif italic mb-1">No regional patterns found</h3>
                        <p className="text-muted-foreground text-xs">
                            We haven't indexed any specific flies for {selectedCountry} yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {groupNames.map(group => (
                            <div key={group} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40 whitespace-nowrap">
                                        {group}
                                    </h2>
                                    <div className="h-px w-full bg-border/40" />
                                    <span className="text-[10px] font-serif italic text-muted-foreground/60 whitespace-nowrap">
                                        {groupedProducts[group].length} Patterns
                                    </span>
                                </div>
                                
                                <div className="flex flex-col gap-4">
                                    {groupedProducts[group].map((product: any) => (
                                        <Link 
                                            key={product.id} 
                                            href={`/${product.is_set ? 'set' : 'product'}/${product.slug}`}
                                            className="flex bg-white hover:bg-muted/5 transition-colors group p-4 border border-border/30"
                                        >
                                            <div className="h-40 w-40 shrink-0 relative bg-[#F9F9F7] border border-border/40 overflow-hidden group-hover:border-foreground/20 transition-colors">
                                                {product.primary_image ? (
                                                    <img 
                                                        src={product.primary_image} 
                                                        alt={product.title}
                                                        className="object-contain w-full h-full p-2 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-black uppercase">No Media</div>
                                                )}
                                            </div>
                                            
                                            <div className="pl-6 flex flex-col justify-center min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-base font-serif font-bold group-hover:text-secondary transition-colors truncate pr-2">
                                                        {product.title}
                                                    </h3>
                                                    <ChevronRight className="w-4 h-4 text-border group-hover:text-secondary transition-colors shrink-0 mt-1" />
                                                </div>
                                                <div 
                                                    className="text-[12px] text-muted-foreground mt-1 line-clamp-4 leading-relaxed font-light prose-p:my-0"
                                                    dangerouslySetInnerHTML={{ __html: product.details || product.description || "Technical specifications pending for this regional pattern variant." }}
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    {product.sku && (
                                                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/40 px-2 py-0.5 bg-muted/30">
                                                            REF: {product.sku}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Footer Info */}
                {!isLoading && products.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-muted-foreground italic font-serif">
                             Showing {products.length} patterns across {groupNames.length} technical classifications.
                        </p>
                        <div className="flex gap-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-opacity hover:opacity-60 cursor-help">Technical Index</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-opacity hover:opacity-60 cursor-help">Wholesale Inquiries</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
