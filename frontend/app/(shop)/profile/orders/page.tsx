"use client";

import { fetchOrders } from '@/api/orderApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronRight, Clock, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchOrders();
            setOrders(Array.isArray(data) ? data : (data?.results || []));
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Map backend status codes to display values
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
            case 'P': return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200';
            case 'A': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-200';
            case 'S': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-200';
            case 'D': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200';
            case 'C': return 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive-200';
            default: return 'bg-secondary text-secondary-foreground';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadOrders}>Try Again</Button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">My Orders</h1>
                    <p className="text-muted-foreground">Track and manage your recent purchases.</p>
                </div>
                <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">
                            When you place an order, it will appear here.
                        </p>
                        <Link href="/fly-bars">
                            <Button>Start Shopping</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">My Orders</h1>
                <p className="text-muted-foreground">Track and manage your recent purchases.</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden group transition-all hover:shadow-md">
                        <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-lg font-serif">Order #{order.id}</p>
                                        <Badge variant="outline" className={`border-0 ${getStatusColor(order.status)}`}>
                                            {getStatusDisplay(order.status)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Placed on {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex -space-x-2 overflow-hidden py-1">
                                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted overflow-hidden">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                    {item.product_name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-background bg-muted items-center justify-center text-xs font-medium text-muted-foreground">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 px-0 md:px-4">
                                    <p className="text-sm font-medium line-clamp-1">
                                        {order.items?.map((i: any) => i.product_name).join(', ') || 'No items'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.items?.length || 0} Item{(order.items?.length || 0) !== 1 && 's'}
                                    </p>
                                </div>

                                <Link href={`/profile/orders/${order.id}`}>
                                    <Button variant="outline" size="sm">
                                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
