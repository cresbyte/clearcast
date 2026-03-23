"use client";

import { fetchOrderById } from '@/api/orderApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ChevronLeft, Clock, CreditCard, Loader2, MapPin, Package, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface OrderDetailsProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetails({ params }: OrderDetailsProps) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOrderById(parseInt(id, 10));
            setOrder(data);
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Order not found');
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentIcon = (method: string) => {
        if (method === 'MPESA') return <Smartphone className="w-4 h-4 text-green-600" />;
        return <CreditCard className="w-4 h-4" />;
    };

    const getPaymentDisplay = (transaction: any) => {
        if (!transaction) return { type: 'Unknown', details: '' };

        const method = transaction.payment_method;
        const data = transaction.response_data || {};

        if (method === 'MPESA') {
            return {
                type: 'M-Pesa',
                details: data.phone_number || '',
                receipt: data.mpesa_receipt
            };
        } else if (method === 'CARD') {
            return {
                type: data.card_type || 'Card',
                details: `**** ${data.card_last4 || '****'}`,
                receipt: data.authorization_code
            };
        } else if (method === 'PAYPAL') {
            return {
                type: 'PayPal',
                details: '',
                receipt: data.paypal_transaction_id
            };
        }
        return { type: method, details: '' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">Order Not Found</h2>
                <p className="mt-2">The order you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/profile/orders" className="text-primary underline mt-4 block">Return to Orders</Link>
            </div>
        );
    }

    const latestTransaction = order.transactions?.[0];
    const paymentInfo = getPaymentDisplay(latestTransaction);

    // Build timeline from order data
    const timeline = [
        { status: 'Order Placed', date: formatDate(order.created_at), completed: true }
    ];

    if (order.status !== 'P') {
        timeline.push({ status: 'Payment Confirmed', date: formatDate(order.created_at), completed: true });
    }
    if (order.status === 'S' || order.status === 'D') {
        timeline.push({ status: 'Shipped', date: 'In transit', completed: true });
    }
    if (order.status === 'D') {
        timeline.push({ status: 'Delivered', date: 'Completed', completed: true });
    }
    if (order.status === 'C') {
        timeline.push({ status: 'Cancelled', date: formatDate(order.updated_at), completed: true });
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            <div className="mb-7">
                <Link href="/profile/orders">
                    <Button variant="ghost" className="pl-1 hover:pl-2 transition-all rounded-none">
                        <ChevronLeft className="mr-3 h-4 w-4" /> Back to Orders
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                        Order #{order.id}
                        <Badge className={`text-base px-3 py-1 rounded-none ${getStatusColor(order.status)}`}>
                            {getStatusDisplay(order.status)}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Placed on {formatDate(order.created_at)}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-none">Download Invoice</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Status Timeline */}
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertCircle className="w-5 h-5 text-primary" /> Order Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l-2 border-muted ml-2 space-y-8 pb-2">
                                {timeline.map((event, idx) => (
                                    <div key={idx} className="ml-8 relative">
                                        <div className={`absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-background ${event.completed ? 'bg-primary' : 'bg-muted'}`} />
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                            <p className={`font-medium ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status}</p>
                                            <p className="text-sm text-muted-foreground">{event.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Package className="w-5 h-5 text-primary" /> Items ({order.items?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="h-20 w-20 bg-muted rounded-none overflow-hidden flex-shrink-0 border border-border">
                                        {item.product_image ? (
                                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                <Package className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-base truncate pr-4 text-serif">{item.product_name}</p>
                                                {item.variant_name && (
                                                    <p className="text-sm text-muted-foreground mt-1">Variant: {item.variant_name}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">${parseFloat(item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${parseFloat(order.subtotal || order.total_amount).toFixed(2)}</span>
                                </div>
                                {parseFloat(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <div className="flex items-center gap-2">
                                            <span>Discount</span>
                                            {order.coupon_code && (
                                                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-green-100 text-green-700 hover:bg-green-100 border-green-200 rounded-none">
                                                    {order.coupon_code}
                                                </Badge>
                                            )}
                                        </div>
                                        <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar info */}
                <div className="space-y-6">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="text-lg">Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                    <MapPin className="w-4 h-4" /> Shipping Address
                                </h3>
                                <div className="text-sm leading-relaxed whitespace-pre-line font-serif italic">
                                    {order.shipping_address}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {getPaymentIcon(latestTransaction?.payment_method)} Payment Method
                                </h3>
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">{paymentInfo.type}</p>
                                    {paymentInfo.details && <p className="text-muted-foreground">{paymentInfo.details}</p>}
                                    {paymentInfo.receipt && (
                                        <p className="text-xs text-muted-foreground mt-1 text-mono">Ref: {paymentInfo.receipt}</p>
                                    )}
                                </div>
                            </div>
                            {order.transaction_id && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                            Transaction ID
                                        </h3>
                                        <p className="text-sm font-mono text-foreground break-all">{order.transaction_id}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-dashed rounded-none">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground text-center">
                                Need help with this order? <a href="#" className="text-primary hover:underline">Contact Support</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
