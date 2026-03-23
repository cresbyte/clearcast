"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Printer,
    MapPin,
    Mail,
    ChevronLeft,
    Loader2,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { fetchOrderById, updateOrderStatus } from "@/api/orderApi";
import { toast } from 'sonner';
import RouteGuard from "@/components/RouteGuard";

export default function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOrderById(id as any);
            setOrder(data);
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Order not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <RouteGuard requireAdmin>
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground italic font-serif">Loading order details...</p>
                </div>
            </RouteGuard>
        );
    }

    if (error || !order) {
        return (
            <RouteGuard requireAdmin>
                <div className="p-12 text-center text-muted-foreground">
                    <h2 className="text-2xl font-bold font-serif italic">Order Not Found</h2>
                    <p className="mt-2 text-sm">{error || "The order you're looking for doesn't exist."}</p>
                    <Link href="/admin/orders">
                        <Button variant="link" className="mt-4 rounded-none text-[10px] uppercase tracking-widest font-bold">Back to Orders</Button>
                    </Link>
                </div>
            </RouteGuard>
        );
    }

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            setIsUpdating(true);
            await updateOrderStatus(order.id, newStatus);
            toast.success(`Order status updated to ${getStatusDisplay(newStatus)}`);
            loadOrder();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusDisplay = (status: string) => {
        const statusMap: Record<string, string> = {
            'P': 'Pending',
            'A': 'Paid',
            'S': 'Shipped',
            'D': 'Delivered',
            'C': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'P': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
            case 'A': return 'bg-blue-500/10 text-blue-500 border-blue-200';
            case 'S': return 'bg-orange-500/10 text-orange-500 border-orange-200';
            case 'D': return 'bg-green-500/10 text-green-500 border-green-200';
            case 'C': return 'bg-destructive/10 text-destructive border-destructive-200';
            default: return 'bg-secondary text-secondary-foreground';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const latestTransaction = order.transactions?.[0];

    return (
        <RouteGuard requireAdmin>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 border border-border/50 rounded-none">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders">
                            <Button variant="ghost" size="icon" className="rounded-none">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 font-serif italic">
                                Order #{order.id}
                                <Badge variant="outline" className={`border text-[10px] uppercase tracking-widest font-bold rounded-none ${getStatusColor(order.status)}`}>
                                    {order.status_display || getStatusDisplay(order.status)}
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 italic">
                                {formatDate(order.created_at)} • Created via Online Store
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>

                        {order.status === 'P' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('A')}
                                className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Mark as Paid
                            </Button>
                        )}

                        {order.status === 'A' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('S')}
                                className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                                Mark as Shipped
                            </Button>
                        )}

                        {order.status === 'S' && (
                            <Button
                                variant="default"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('D')}
                                className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                                Mark as Delivered
                            </Button>
                        )}

                        {order.status !== 'C' && order.status !== 'D' && (
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('C')}
                                className="rounded-none text-[10px] uppercase tracking-widest font-bold bg-red-600/10 text-red-600 hover:bg-red-600/20"
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Order Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-start pb-6 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="h-20 w-20 bg-muted/30 rounded-none overflow-hidden flex-shrink-0 border border-border/50">
                                            {item.product_image ? (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-serif font-bold">{item.product_name}</p>
                                            {item.variant_name && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Variant: {item.variant_name}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                                                ID: {item.product}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">
                                                ${parseFloat(item.price || '0').toFixed(2)} × {item.quantity}
                                            </p>
                                            <p className="font-bold mt-1 text-lg">
                                                ${(parseFloat(item.price || '0') * (item.quantity || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="space-y-3 pt-6 border-t font-mono text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${parseFloat(order.subtotal || order.total_amount || '0').toFixed(2)}</span>
                                    </div>
                                    {parseFloat(order.discount_amount || '0') > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <div className="flex items-center gap-2">
                                                <span>Discount</span>
                                                {order.coupon_code && (
                                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest h-5 px-1.5 bg-green-500/10 text-green-600 border-green-200 rounded-none">
                                                        {order.coupon_code}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold">Free</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4 border-border/50">
                                        <span className="font-serif italic font-normal text-muted-foreground">Total</span>
                                        <span>${parseFloat(order.total_amount || '0').toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline (Basic) */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Order History</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm items-center py-2 border-b border-border/50">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Email</span>
                                    <span className="font-medium italic">{order.email}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center py-2 border-b border-border/50">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Transaction ID</span>
                                    <span className="font-mono">{order.transaction_id || 'N/A'}</span>
                                </div>
                                {latestTransaction && (
                                    <div className="flex justify-between text-sm items-center py-2 border-b border-border/50">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Payment Method</span>
                                        <span className="flex items-center gap-2 font-medium font-serif italic">
                                            {latestTransaction.payment_method === 'MPESA' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                                            {latestTransaction.payment_method}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm items-center py-2">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Updated At</span>
                                    <span className="font-medium italic">{formatDate(order.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Customer Info */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="font-serif italic">Customer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-muted/50 flex items-center justify-center font-serif text-lg font-bold">
                                        {order.full_name?.charAt(0) || order.email?.charAt(0) || "?"}
                                    </div>
                                    <span className="font-bold font-serif text-lg">{order.full_name}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Mail className="h-3 w-3" /> Contact
                                    </p>
                                    <p className="text-sm italic">{order.email}</p>
                                </div>
                                <Separator className="border-border/50" />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <MapPin className="h-3 w-3" /> Shipping Address
                                    </p>
                                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line italic p-4 bg-muted/20 border border-border/50">
                                        {order.shipping_address}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {latestTransaction && latestTransaction.response_data && (
                            <Card className="rounded-none border-border/50">
                                <CardHeader>
                                    <CardTitle className="font-serif italic text-base">Payment Logs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-xs font-mono bg-black/5 dark:bg-black p-4 border border-border/50 rounded-none w-full break-all overflow-hidden text-muted-foreground">
                                        {typeof latestTransaction.response_data === 'object' ? (
                                            Object.entries(latestTransaction.response_data).map(([key, value]) => (
                                                <div key={key} className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4 overflow-hidden border-b border-border/30 last:border-0 pb-1 last:pb-0">
                                                    <span className="font-bold text-foreground shrink-0">{key}:</span>
                                                    <span className="truncate">{String(value)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div>{String(latestTransaction.response_data)}</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
