"use client";

import { useProduct } from '@/api/productQueries';
import { fetchProductReviews } from '@/api/reviewApi';
import { Button } from '@/components/ui/button';
import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import { Heart, Minus, Plus, RefreshCw, Share2, Shield, ShoppingBag, Star, Truck } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import RelatedProducts from '@/components/shop/RelatedProducts';

const ProductDetails = ({ params }: { params: Promise<{ slug: string }> }) => {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const { data: product, isLoading, isError } = useProduct(slug);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const { toggleItem, isInWishlist } = useWishlistStore();
    const [isAdding, setIsAdding] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    const inWishlist = product ? isInWishlist(product.id) : false;

    // Selection & Actions
    const availableVariants = product?.variants?.filter((v: any) => v.stock_quantity > 0) || [];

    // Initialize selected variant when product loads
    useEffect(() => {
        if (availableVariants.length > 0 && !selectedVariant) {
            setSelectedVariant(availableVariants[0]);
        }
    }, [product, availableVariants, selectedVariant]);

    // Fetch reviews
    useEffect(() => {
        const loadReviews = async () => {
            if (!product?.id) return;
            try {
                setReviewsLoading(true);
                const data = await fetchProductReviews(product.id, currentPage);
                setReviews(data.results || []);
                setTotalReviews(data.count || 0);
                setTotalPages(Math.ceil((data.count || 0) / 10));
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setReviewsLoading(false);
            }
        };

        loadReviews();
    }, [product?.id, currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-white">
                <div className="text-center space-y-6">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Loading Details</p>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-4 bg-white">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-serif font-bold tracking-tight">Product Not Found</h2>
                    <p className="text-muted-foreground text-sm">The selection you are looking for is currently unavailable.</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-white transition-all duration-500">
                        Back to Collection
                    </Button>
                </Link>
            </div>
        );
    }

    const handleVariantChange = (variant: any) => {
        setSelectedVariant(variant);
    };

    const increment = () => setQuantity(prev => (prev < availableStock ? prev + 1 : prev));
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (!selectedVariant && availableVariants.length > 0) return;

        setIsAdding(true);
        addItem(product, selectedVariant, quantity);

        setTimeout(() => setIsAdding(false), 1500);
    };

    const handleToggleWishlist = () => {
        toggleItem(product);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    // Determine current display values
    const currentPrice = selectedVariant?.current_price !== undefined
        ? parseFloat(selectedVariant.current_price || 0)
        : parseFloat(product.current_price || product.price || 0);

    const originalPrice = selectedVariant?.price !== undefined
        ? parseFloat(selectedVariant.price || 0)
        : parseFloat(product.price || 0);

    const hasDiscount = currentPrice < originalPrice && originalPrice > 0;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    const availableStock = selectedVariant ? (selectedVariant.stock_quantity || 0) : (product.stock_quantity || 0);
    const isAvailable = availableStock > 0;

    // Image logic
    const images = product.images || (product.primary_image ? [product.primary_image] : []);
    const currentImage = images[selectedImageIndex] || '';

    const getRatingStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-foreground fill-current' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Breadcrumb - Super minimal */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                    {product.filters?.[0] && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/shop?filter=${product.filters[0].slug}`}
                                className="hover:text-primary transition-colors truncate max-w-[100px]"
                            >
                                {product.filters[0].name}
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Image Column */}
                    <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24 h-fit">
                        <div className="relative w-full lg:max-h-[70vh] flex items-center justify-center bg-[#F9F9F7] overflow-hidden">
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-muted/20 animate-pulse" />
                            )}
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className={`w-full max-h-[70vh] object-contain grayscale-[0.1] transition-all duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9F9F7]">
                                    <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-black">Image Unavailable</p>
                                </div>
                            )}

                            {!isAvailable && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] bg-white px-8 py-4 border border-border shadow-sm">Archived / Sold Out</span>
                                </div>
                            )}

                            {hasDiscount && isAvailable && (
                                <div className="absolute top-6 left-6 bg-primary text-primary-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                    -{discountPercent}%
                                </div>
                            )}
                        </div>

                        {/* Minimal Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setSelectedImageIndex(idx); setImageLoaded(false); }}
                                        className={`flex-shrink-0 w-20 aspect-[4/5] bg-muted overflow-hidden border transition-all duration-300 ${selectedImageIndex === idx ? 'border-primary' : 'border-border/30 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="th" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Column */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="space-y-6 mb-12">
                            <div className="space-y-2">
                                {product.filters?.length > 0 && (
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">
                                        {product.filters.map((f: any) => f.name).join(' • ')}
                                    </p>
                                )}
                                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-[1.1] tracking-tighter">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 pt-1">
                                    {getRatingStars(product.average_rating || 0)}
                                    <span className="text-[11px] font-medium text-muted-foreground/60 tracking-wider">
                                        {product.reviews_count || 0} reviews
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-serif font-bold text-foreground">
                                    ${currentPrice.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-lg text-muted-foreground/40 line-through font-serif italic">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <div className="w-12 h-[1px] bg-border" />

                            <p className="text-[14px] leading-relaxed text-muted-foreground/80 max-w-md">
                                {product.description}
                            </p>
                        </div>

                        {/* Selection & Actions */}
                        <div className="space-y-10">
                            {/* Variants - Minimal rectangular buttons */}
                            {availableVariants.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-foreground">Select Size</span>
                                        {selectedVariant && <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{selectedVariant.size}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {availableVariants.map((variant: any) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => handleVariantChange(variant)}
                                                className={`h-11 px-6 flex items-center justify-center border text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${selectedVariant?.id === variant.id
                                                    ? 'border-foreground bg-foreground text-white'
                                                    : 'border-border hover:border-foreground text-foreground'
                                                    }`}
                                            >
                                                {variant.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Qty & Add to Cart */}
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex items-center border border-border h-14 w-32">
                                        <button onClick={decrement} className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-30"><Minus className="h-3 w-3" /></button>
                                        <div className="flex-1 h-full flex items-center justify-center text-xs font-black tracking-widest">{quantity}</div>
                                        <button onClick={increment} className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-30"><Plus className="h-3 w-3" /></button>
                                    </div>

                                    <Button
                                        className="h-14 flex-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-none shadow-lg shadow-primary/5"
                                        disabled={!isAvailable || isAdding || (!selectedVariant && product.variants?.length > 0)}
                                        onClick={handleAddToCart}
                                    >
                                        {isAdding ? 'Processing...' : (isAvailable ? 'Secure to Cart' : 'Archived')}
                                    </Button>

                                    <button
                                        onClick={handleToggleWishlist}
                                        className={`h-14 w-14 flex items-center justify-center border border-border hover:border-primary transition-all duration-300 group ${inWishlist ? 'bg-primary/5 border-primary' : ''}`}
                                    >
                                        <Heart className={`h-5 w-5 transition-all duration-500 ${inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground/40 group-hover:text-primary'}`} />
                                    </button>
                                </div>

                                {isAvailable && (
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-center py-2 ${availableStock < 10 ? 'text-primary animate-pulse' : 'text-muted-foreground/40'}`}>
                                        {availableStock < 10 ? `Extremely Limited: Only ${availableStock} Remaining` : `Current Availability: ${availableStock} Pieces`}
                                    </p>
                                )}
                            </div>

                            {/* Trust Features - Clean grid */}
                            <div className="grid grid-cols-3 gap-4 py-8 border-y border-border/40">
                                {[
                                    { icon: Truck, label: 'Free Delivery' },
                                    { icon: RefreshCw, label: '30D Returns' },
                                    { icon: Shield, label: 'Secured Checkout' }
                                ].map((feat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-3 text-center">
                                        <feat.icon className="h-4 w-4 text-primary/60" />
                                        <span className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">{feat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Technical Specs - Sleek rows */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">Specifications</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Identifier', value: selectedVariant?.sku || product.sku || 'N/A' },
                                        { label: 'Origin', value: 'Imported' },
                                        { label: 'Material', value: (product.metadata as any)?.material || 'Handcrafted Luxury' }
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 text-[11px]">
                                            <span className="font-bold text-muted-foreground/60 uppercase tracking-widest">{spec.label}</span>
                                            <span className="font-medium text-foreground tracking-wider">{spec.value}</span>
                                        </div>
                                    ))}
                                    <button onClick={handleShare} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 hover:opacity-50 transition-opacity">
                                        <Share2 className="h-3 w-3" /> Share Piece
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extended Details Section */}
                {product.details && (
                    <div className="mt-20 pt-16 border-t border-border/20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-0">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60 mb-8">
                                Detailed Origins
                            </h3>
                            <div
                                className="prose prose-sm md:prose-base max-w-none text-muted-foreground/90 font-serif leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.details }}
                            />
                        </div>
                    </div>
                )}

                {/* Reviews Section - Modern & Spacious */}
                <div className="mt-20 pt-20 border-t border-border/40">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="space-y-4">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Community</span>
                                <h2 className="text-5xl font-serif font-bold tracking-tighter">Client Testimony</h2>
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-4xl font-serif font-bold">{product.average_rating || 0}</span>
                                    <div className="space-y-1">
                                        {getRatingStars(product.average_rating || 0)}
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{product.reviews_count || 0} VERIFIED REVIEWS</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground">Write a Review</Button>
                        </div>

                        <div className="space-y-16">
                            {reviewsLoading ? (
                                <div className="py-20 text-center"><div className="h-6 w-6 border-b-2 border-primary animate-spin mx-auto" /></div>
                            ) : reviews.length === 0 ? (
                                <div className="py-20 text-center border border-dashed border-border group hover:border-primary transition-colors cursor-default">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Be the first to share your experience</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-12">
                                        {reviews.map((review: any) => (
                                            <div key={review.id} className="group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-[#F9F9F7] flex items-center justify-center text-muted-foreground/30 text-[10px] font-bold border border-border/40">
                                                            {review.user_details?.first_name?.[0]}{review.user_details?.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-widest">
                                                                {review.user_details?.first_name} {review.user_details?.last_name?.[0]}.
                                                            </p>
                                                            <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest mt-0.5">
                                                                {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getRatingStars(review.rating)}
                                                </div>
                                                <p className="text-[14px] leading-loose text-muted-foreground/80 font-medium italic pl-14">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-8 pt-12">
                                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="text-[10px] font-black uppercase tracking-widest disabled:opacity-20 hover:text-primary transition-colors">Previous</button>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{currentPage} / {totalPages}</span>
                                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="text-[10px] font-black uppercase tracking-widest disabled:opacity-20 hover:text-primary transition-colors">Next</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Related Products Section */}
                <RelatedProducts currentProduct={product} />
            </div>
        </div>
    );
};

export default ProductDetails;

