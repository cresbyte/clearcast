"use client";

import { fetchDiscounts } from "@/api/discountApi";
import { fetchOrders } from "@/api/orderApi";
import { fetchPendingReviews } from "@/api/reviewApi";
import ReviewModal from "@/components/profile/ReviewModal";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import useWishlistStore from "@/hooks/useWishlistStore";
import {
    Heart,
    Loader2,
    MessageSquare,
    Package,
    Star,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const { user } = useAuth();
    const { items: wishlistItems } = useWishlistStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [pendingReviews, setPendingReviews] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersData, pendingData, couponsData] = await Promise.all([
                fetchOrders(),
                fetchPendingReviews(),
                fetchDiscounts(),
            ]);
            setOrders(
                Array.isArray(ordersData) ? ordersData : ordersData?.results || [],
            );
            setPendingReviews(
                Array.isArray(pendingData) ? pendingData : pendingData?.results || [],
            );
            setCoupons(
                Array.isArray(couponsData) ? couponsData : couponsData?.results || [],
            );
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const handleWriteReview = (product: any) => {
        setSelectedProduct(product);
        setIsReviewModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.first_name || user?.name || "User"}.
                    </p>
                </div>
                {pendingReviews.length > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        You have {pendingReviews.length} product
                        {pendingReviews.length > 1 ? "s" : ""} to review
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-xs text-muted-foreground">Lifetime purchases</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Wishlist Items
                        </CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wishlistItems.length}</div>
                        <p className="text-xs text-muted-foreground">Saved for later</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Reviews
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {pendingReviews.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Items to share feedback on
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className={pendingReviews.length === 0 ? "lg:col-span-2" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                            Track and manage your recent purchases
                        </CardDescription>
                    </div>
                    {orders.length > 5 && (
                        <Link href="/profile/orders">
                            <Button variant="link" size="sm">
                                View All
                            </Button>
                        </Link>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground italic">
                                No recent orders found.
                            </p>
                        ) : (
                            orders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 p-2 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">Order #{order.id}</p>
                                            <div
                                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${order.status === "D"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status === "C"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {order.status_display}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-bold text-foreground">
                                            ${parseFloat(order.total_amount).toFixed(2)}
                                        </div>
                                        <Link href={`/profile/orders/${order.id}`}>
                                            <Button variant="ghost" size="sm">
                                                Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Reviews */}
                {pendingReviews.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Pending Reviews</CardTitle>
                            <CardDescription>
                                Share your experience with recent purchases
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingReviews.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 bg-white p-4 border shadow-sm"
                                    >
                                        <div className="h-16 w-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0].image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                    <Package className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                {product.category_name}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
                                            onClick={() => handleWriteReview(product)}
                                        >
                                            Write Review
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Available Coupons */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Coupons</CardTitle>
                        <CardDescription>Available discounts for you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {coupons.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground italic">
                                No coupons available.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {coupons.map((coupon) => (
                                    <div
                                        key={coupon.id}
                                        className="flex items-center justify-between border border-dashed border-primary/30 bg-primary/5 p-4 rounded-lg"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-primary" />
                                                <span className="font-bold font-mono text-lg">
                                                    {coupon.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {coupon.discount_type === "P"
                                                    ? `${coupon.value}% OFF`
                                                    : `$${coupon.value} OFF`}
                                                {Number(coupon.min_order_amount) > 0 &&
                                                    ` • Min order $${coupon.min_order_amount}`}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (typeof navigator !== 'undefined') {
                                                    navigator.clipboard.writeText(coupon.code);
                                                }
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={selectedProduct}
                onReviewSubmitted={loadDashboardData}
            />
        </div>
    );
}
