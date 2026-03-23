import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ShopHeader = ({
    title = "All Product",
    categories = [],
    selectedCategories = [],
    onCategoryClick
}) => {
    return (
        <div className="bg-white border-b border-border/50 pt-12 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3 opacity-30" />
                    <span className="text-foreground font-medium">Collection</span>
                </nav>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-12 tracking-tight">
                    {title}
                </h1>

                {/* Category Navigation Cards */}
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-4 md:gap-6 lg:gap-8">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.slug);
                        return (
                            <button
                                key={cat.slug}
                                onClick={() => onCategoryClick(cat.slug)}
                                className="flex-shrink-0 group text-left outline-none"
                            >
                                <div className={cn(
                                    "relative aspect-[4/3] w-40 md:w-56 overflow-hidden bg-muted mb-4 transition-all duration-500",
                                    isSelected && "ring-2 ring-primary ring-offset-4 ring-offset-background"
                                )}>
                                    <img
                                        src={cat.image || "/api/placeholder/400/300"}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all duration-300" />
                                </div>
                                <span className={cn(
                                    "text-xs md:text-sm font-medium tracking-wide transition-colors",
                                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShopHeader;
