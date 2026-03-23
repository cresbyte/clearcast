"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star, Package, User, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchReviewDetails, deleteReview } from '@/api/reviewApi';
import { toast } from 'sonner';
import RouteGuard from '@/components/RouteGuard';

export default function AdminReviewDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviewDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchReviewDetails(id);
                setReview(data);
            } catch (error) {
                console.error('Failed to load review details:', error);
                toast.error('Failed to load review details.');
            } finally {
                setLoading(false);
            }
        };
        loadReviewDetails();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            try {
                await deleteReview(id);
                toast.success('Review deleted successfully');
                router.push('/admin/reviews');
            } catch (error) {
                console.error('Failed to delete review:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'}`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <RouteGuard requireAdmin>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground italic font-serif">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading review details...</p>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (!review) {
        return (
            <RouteGuard requireAdmin>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-serif italic">Review not found</h2>
                        <p className="text-muted-foreground text-sm">The review you are looking for does not exist.</p>
                    </div>
                    <Link href="/admin/reviews">
                        <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold">Back to Reviews</Button>
                    </Link>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requireAdmin>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/reviews">
                            <Button variant="ghost" size="icon" className="rounded-none bg-background hover:bg-muted">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-serif italic">Review Details</h1>
                            <p className="text-muted-foreground text-sm mt-1">Review #{review.id}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Review Content */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {getRatingStars(review.rating)}
                                        <span className="text-sm font-bold font-serif italic">
                                            {review.rating} out of 5
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs italic uppercase tracking-wider text-muted-foreground">
                                        Reviewed on {formatDate(review.created_at)}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap font-serif italic p-4 bg-muted/20 border-l-2 border-primary/30">
                                    "{review.comment}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Admin Actions */}
                        <Card className="rounded-none border-destructive/30 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="font-serif italic text-destructive">Management</CardTitle>
                                <CardDescription>Administrative actions for this review</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    className="w-full flex items-center justify-center gap-2 rounded-none text-[10px] uppercase tracking-widest font-bold"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Review Permanently
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Product Info */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-serif italic">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    Product
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-square bg-muted/30 rounded-none overflow-hidden border border-border/50">
                                    {review.product_details?.images?.[0] ? (
                                        <img
                                            src={review.product_details.images[0].image}
                                            alt={review.product_details.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                            <Package className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 bg-muted/20 p-3 border border-border/50">
                                    <p className="font-bold font-serif">{review.product_details?.name || "Unknown Product"}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                                        SKU: {review.product_details?.sku || "N/A"}
                                    </p>
                                </div>
                                {review.product && (
                                    <Link href={`/admin/products/${review.product}`}>
                                        <Button variant="outline" size="sm" className="w-full rounded-none text-[10px] uppercase tracking-widest font-bold">
                                            View Product
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-serif italic">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted/20 p-4 border border-border/50 space-y-2">
                                    <p className="font-bold font-serif mb-1">
                                        {review.user_details?.first_name} {review.user_details?.last_name}
                                        {(!review.user_details?.first_name && !review.user_details?.last_name) && "Unknown User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                                        {review.user_details?.email || "No email provided"}
                                    </p>
                                </div>
                                {review.user && (
                                    <Link href={`/admin/customers/${review.user}`}>
                                        <Button variant="outline" size="sm" className="w-full rounded-none text-[10px] uppercase tracking-widest font-bold">
                                            View Customer
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
