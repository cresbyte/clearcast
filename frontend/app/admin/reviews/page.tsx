"use client";

import { fetchAllReviews } from '@/api/reviewApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Package, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ReviewList() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                setLoading(true);
                const data = await fetchAllReviews();
                setReviews(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                console.error('Failed to load reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        loadReviews();
    }, []);

    const stats = {
        total: reviews.length,
        avgRating: reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0',
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 italic text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading reviews...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-none border border-border/50">
                <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Reviews</h1>
                <p className="text-muted-foreground mt-1 italic">Manage customer product reviews</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Total Reviews</CardDescription>
                        <CardTitle className="text-3xl font-serif">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Avg Rating</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2 font-serif">
                            {stats.avgRating}
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Reviews Table */}
            <Card className="rounded-none shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Product</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Customer</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Rating</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Review</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Date</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow
                                    key={review.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 bg-muted rounded-none overflow-hidden border">
                                                {review.product_details?.images?.[0] ? (
                                                    <img
                                                        src={review.product_details.images[0].image}
                                                        alt={review.product_details.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm font-serif">{review.product_details?.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{review.user_details?.first_name} {review.user_details?.last_name}</p>
                                            <p className="text-[10px] text-muted-foreground italic">{review.user_details?.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRatingStars(review.rating)}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-md italic">
                                            {review.comment}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(review.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/reviews/${review.id}`}>
                                            <Button variant="ghost" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                Details
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {reviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground italic">
                    <p>No reviews found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
