"use client";

import { useFilters } from '@/api/filterQueries';
import { useProducts } from '@/api/productQueries';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import useUIStore from '@/stores/useUIStore';
import { ChevronDown, ChevronRight, Filter, LayoutGrid, List, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

interface ShopLayoutProps {
    isSet: boolean;
    fallbackTitle?: string;
}

const ShopLayout = ({ isSet, fallbackTitle = "Shop" }: ShopLayoutProps) => {
    const [page, setPage] = React.useState(1);
    const searchParams = useSearchParams();
    const [initializedFromUrl, setInitializedFromUrl] = React.useState(false);
    const [localPriceRange, setLocalPriceRange] = React.useState<[number, number]>([0, 2000]);

    const {
        searchQuery,
        selectedFilters,
        toggleFilter,
        resetFilters,
        getActiveFilterCount,
        sortBy,
        setSortBy,
        setSelectedFilters,
        priceRange,
        setPriceRange,
        isSetFilter,
        setIsSetFilter,
    } = useUIStore();

    // Set the filter natively on mount/prop change based on route
    React.useEffect(() => {
        setIsSetFilter(isSet);
    }, [isSet, setIsSetFilter]);

    // Sync local price range with store when store changes (e.g. reset filters)
    React.useEffect(() => {
        setLocalPriceRange(priceRange as [number, number]);
    }, [priceRange]);

    // Debounce price range update to store
    const debouncedLocalPriceRange = useDebounce(localPriceRange, 500);
    React.useEffect(() => {
        if (debouncedLocalPriceRange[0] !== priceRange[0] || debouncedLocalPriceRange[1] !== priceRange[1]) {
            setPriceRange(debouncedLocalPriceRange);
        }
    }, [debouncedLocalPriceRange, priceRange, setPriceRange]);

    // Debounce search query for better performance
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearchQuery, selectedFilters, sortBy, priceRange]);

    // Fetch filters
    const { data: filtersDataResponse = [] } = useFilters();
    const filterGroups = Array.isArray(filtersDataResponse) ? filtersDataResponse : (filtersDataResponse as any).results || [];

    // Build sets of valid filter slugs to guard against stale UI state
    const validFilterSlugs = useMemo(() => {
        const slugs = new Set();
        filterGroups.forEach((group: any) => {
            (group.options || []).forEach((opt: any) => {
                if (opt.slug) slugs.add(opt.slug);
            });
        });
        return slugs;
    }, [filterGroups]);

    const safeSelectedFilters = useMemo(
        () => selectedFilters.filter((slug: string) => validFilterSlugs.has(slug)),
        [selectedFilters, validFilterSlugs]
    );

    // Fetch products with filters
    const { data, isLoading, isError, error } = useProducts({
        searchQuery: debouncedSearchQuery,
        filters: safeSelectedFilters,
        sortBy,
        page,
        priceRange: priceRange,
        isSet: isSetFilter,
    });

    const products = data?.results || [];
    const totalCount = data?.count || 0;
    const hasNext = !!data?.next;
    const hasPrevious = !!data?.previous;
    const totalPages = Math.ceil(totalCount / 24);

    // Pagination Range helper
    const paginationRange = useMemo(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    }, [page, totalPages]);

    // Map from slug to display name for active filter chips
    const slugToNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        filterGroups.forEach((group: any) => {
            (group.options || []).forEach((opt: any) => {
                map[opt.slug] = opt.name;
            });
        });
        return map;
    }, [filterGroups]);

    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

    // Initialize filters from URL (e.g. /shop?filter=slug)
    React.useEffect(() => {
        if (initializedFromUrl) return;

        const filterSlug = searchParams.get('category') || searchParams.get('filter');
        if (!filterSlug) {
            setInitializedFromUrl(true);
            return;
        }

        setSelectedFilters([filterSlug]);
        setInitializedFromUrl(true);
    }, [initializedFromUrl, searchParams, setSelectedFilters]);

    const toggleGroupOpen = (group: string) => {
        setOpenGroups((prev: Record<string, boolean>) => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className="space-y-10">
            {isMobile && (
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-foreground mb-6">Price Range</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                            <span>${localPriceRange[0]}</span>
                            <span>${localPriceRange[1]}+</span>
                        </div>
                        <div className="relative h-1 bg-muted rounded-full">
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                value={localPriceRange[1]}
                                onChange={(e) => setLocalPriceRange([localPriceRange[0], parseInt(e.target.value)])}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                style={{ width: `${(localPriceRange[1] / 2000) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <h3 className={cn("text-xs uppercase tracking-[0.2em] font-bold text-foreground mb-6", !isMobile && "hidden")}>Filters</h3>
                {filterGroups.map((group: any) => (
                    <Collapsible
                        key={group.id}
                        open={openGroups[group.name] !== false}
                        onOpenChange={() => toggleGroupOpen(group.name)}
                    >
                        <div className="space-y-4 shadow-sm border border-border/20 p-2 bg-muted/5">
                            <div className="flex items-center justify-between group">
                                <Label className="text-[11px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors ml-1">
                                    {group.name}
                                </Label>
                                <CollapsibleTrigger
                                    render={
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-transparent hover:bg-transparent" style={{ borderRadius: 0 }}>
                                            {openGroups[group.name] !== false ? (
                                                <ChevronDown className="h-3 w-3 opacity-30" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 opacity-30" />
                                            )}
                                        </Button>
                                    }
                                />
                            </div>
                            <CollapsibleContent className="space-y-3 pt-1">
                                {group.options.map((option: any) => (
                                    <div key={option.slug} className="flex items-center space-x-3 group cursor-pointer ml-1">
                                        <Checkbox
                                            id={`${isMobile ? 'mobile-' : ''}${option.slug}`}
                                            checked={selectedFilters.includes(option.slug)}
                                            onCheckedChange={() => toggleFilter(option.slug)}
                                            style={{ borderRadius: 0 }}
                                            className="h-3.5 w-3.5"
                                        />
                                        <Label
                                            htmlFor={`${isMobile ? 'mobile-' : ''}${option.slug}`}
                                            className="cursor-pointer text-[10px] uppercase tracking-wider text-muted-foreground/80 group-hover:text-foreground group-hover:font-semibold transition-all pt-0.5"
                                        >
                                            {option.name}
                                        </Label>
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                ))}
            </div>
        </div>
    );

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Title */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-foreground">
                        {isSetFilter === true ? "Fly Set" : isSetFilter === false ? "Fly Bars" : fallbackTitle}
                    </h1>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border/50 pb-6">
                    <div className="flex items-center gap-6">
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                            {isLoading ? (
                                'Updating...'
                            ) : (
                                <>
                                    Showing <span className="text-foreground">{products.length}</span> of {totalCount} results
                                </>
                            )}
                        </span>

                        {/* View Toggles (Minimal) */}
                        <div className="hidden sm:flex items-center gap-4 border-l border-border/50 pl-6">
                            <button className="text-primary hover:opacity-70 transition-opacity">
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Minimal Sort */}
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">Sort By</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40 h-9 bg-transparent border-none p-0 focus:ring-0 text-xs font-semibold uppercase tracking-wider" hideIcon>
                                    <SelectValue placeholder="Featured" />
                                    <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-none border-border/50">
                                    <SelectItem value="featured" className="text-xs uppercase tracking-wider">Featured</SelectItem>
                                    <SelectItem value="newest" className="text-xs uppercase tracking-wider">Newest</SelectItem>
                                    <SelectItem value="price_low" className="text-xs uppercase tracking-wider">Price: Low to High</SelectItem>
                                    <SelectItem value="price_high" className="text-xs uppercase tracking-wider">Price: High to Low</SelectItem>
                                    <SelectItem value="name" className="text-xs uppercase tracking-wider">Name: A to Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mobile Filter Trigger (Minimal) */}
                        <Sheet>
                            <SheetTrigger
                                render={
                                    <Button variant="ghost" className="md:hidden h-9 px-4 gap-2 border border-border/50 hover:bg-muted" style={{ borderRadius: 0 }}>
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold">Filters</span>
                                    </Button>
                                }
                            />
                            <SheetContent side="left" className="w-[85vw] sm:w-96 p-0" style={{ borderRadius: 0 }}>
                                <SheetHeader className="p-8 border-b border-border/50 text-left">
                                    <SheetTitle className="text-2xl font-serif">Filters</SheetTitle>
                                    <SheetDescription className="text-xs uppercase tracking-widest mt-1">Refine your selection</SheetDescription>
                                </SheetHeader>
                                <div className="p-8 h-full overflow-y-auto pb-24">
                                    <FilterContent isMobile={true} />
                                    {activeFilterCount > 0 && (
                                        <button
                                            className="w-full mt-12 text-[11px] uppercase tracking-widest font-bold text-primary hover:opacity-70 transition-opacity border-t border-border/50 pt-8"
                                            onClick={resetFilters}
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Active Filters Bar */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mb-10">
                        {selectedFilters.map((slug: string) => {
                            const label = slugToNameMap[slug] || slug;
                            return (
                                <button
                                    key={slug}
                                    onClick={() => toggleFilter(slug)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-[11px] font-medium uppercase tracking-wider transition-colors border border-border/30"
                                    style={{ borderRadius: 0 }}
                                >
                                    {label}
                                    <X className="h-3 w-3 opacity-50" />
                                </button>
                            )
                        })}
                        <button
                            onClick={resetFilters}
                            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                <div className="flex gap-16 lg:gap-12">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden md:block w-52 flex-shrink-0 sticky top-10 self-start">
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-foreground mb-8">Price Range</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                                        <span>${localPriceRange[0]}</span>
                                        <span>${localPriceRange[1]}+</span>
                                    </div>
                                    <div className="relative h-1.5 bg-muted rounded-full">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2000"
                                            value={localPriceRange[1]}
                                            onChange={(e) => setLocalPriceRange([localPriceRange[0], parseInt(e.target.value)])}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                                            style={{ width: `${(localPriceRange[1] / 2000) * 100}%` }}
                                        />
                                        <div
                                            className="absolute top-1/2 -mt-2.5 h-5 w-5 bg-white border-2 border-primary rounded-full shadow-md z-20 pointer-events-none transition-all duration-300"
                                            style={{ left: `calc(${(localPriceRange[1] / 2000) * 100}% - 10px)` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] uppercase tracking-widest opacity-50">Min Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">$</span>
                                                <input
                                                    type="number"
                                                    value={localPriceRange[0]}
                                                    onChange={(e) => setLocalPriceRange([parseInt(e.target.value) || 0, localPriceRange[1]])}
                                                    className="w-full h-9 bg-muted/30 border border-border/40 pl-6 pr-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                                    style={{ borderRadius: 0 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] uppercase tracking-widest opacity-50">Max Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">$</span>
                                                <input
                                                    type="number"
                                                    value={localPriceRange[1]}
                                                    onChange={(e) => setLocalPriceRange([localPriceRange[0], parseInt(e.target.value) || 0])}
                                                    className="w-full h-9 bg-muted/30 border border-border/40 pl-6 pr-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                                    style={{ borderRadius: 0 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FilterContent />
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    className="text-[10px] uppercase tracking-widest font-black text-primary hover:opacity-70 transition-opacity border-t border-border/50 pt-8 w-full text-left"
                                    onClick={resetFilters}
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading products...</p>
                            </div>
                        ) : isError ? (
                            <div className="text-center py-32 border-2 border-dashed border-destructive/50 bg-destructive/5" style={{ borderRadius: 0 }}>
                                <p className="text-destructive font-semibold text-lg mb-2">Error Loading Products</p>
                                <p className="text-muted-foreground">{(error as Error)?.message || 'Something went wrong.'}</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-32 border-2 border-dashed border-border" style={{ borderRadius: 0 }}>
                                <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-xl font-semibold mb-2">No Products Found</p>
                                <p className="text-muted-foreground mb-6">
                                    No products match your current filters.
                                </p>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="outline"
                                        style={{ borderRadius: 0 }}
                                        onClick={resetFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Results Count */}
                                <div className="mb-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-semibold text-foreground">{products.length}</span> of{' '}
                                        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> products
                                    </p>
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                                    {products.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-16 pt-8 border-t border-border">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <p className="text-sm text-muted-foreground">
                                                Page <span className="font-semibold text-foreground">{page}</span> of{' '}
                                                <span className="font-semibold text-foreground">{totalPages}</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={!hasPrevious}
                                                    style={{ borderRadius: 0 }}
                                                    className="min-w-[100px]"
                                                >
                                                    Previous
                                                </Button>
                                                <div className="hidden sm:flex items-center gap-1">
                                                    {paginationRange.map((pageNum, idx) => {
                                                        if (pageNum === '...') {
                                                            return <span key={`dots-${idx}`} className="px-3 text-muted-foreground">...</span>;
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={page === pageNum ? 'default' : 'outline'}
                                                                onClick={() => setPage(pageNum as number)}
                                                                className="w-10 h-10 p-0 text-xs font-bold"
                                                                style={{ borderRadius: 0 }}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setPage(p => p + 1)}
                                                    disabled={!hasNext}
                                                    style={{ borderRadius: 0 }}
                                                    className="min-w-[100px]"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopLayout;