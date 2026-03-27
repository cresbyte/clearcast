"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchCustomOrders } from "@/api/orderApi";
import { toast } from "sonner";

export default function CustomOrderList() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchCustomOrders();
            setOrders(Array.isArray(data) ? data : data?.results || []);
        } catch (error) {
            console.error("Failed to fetch custom orders:", error);
            toast.error("Failed to load custom orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
            case "Processing":
                return "bg-blue-500/10 text-blue-500 border-blue-200";
            case "Shipped":
                return "bg-orange-500/10 text-orange-500 border-orange-200";
            case "Delivered":
                return "bg-green-500/10 text-green-500 border-green-200";
            case "Canceled":
                return "bg-destructive/10 text-destructive border-destructive-200";
            default:
                return "bg-secondary text-secondary-foreground";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const filteredOrders = orders.filter((o) => {
        const name = o.customer_details?.name?.toLowerCase() || "";
        const email = o.customer_details?.email?.toLowerCase() || "";
        const sq = searchQuery.toLowerCase();
        return name.includes(sq) || email.includes(sq) || o.id.toString().includes(sq);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Custom Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage manual orders and phone orders.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={loadOrders}
                        disabled={loading}
                        className="rounded-none shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <Link href="/admin/custom-orders/new">
                        <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> New Order
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search custom orders..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-border overflow-hidden bg-card rounded-none shadow-md">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 italic text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading custom orders...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-[10px] uppercase tracking-widest font-bold">Order ID</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Customer</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order: any) => (
                                <TableRow
                                    key={order.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/custom-orders/${order.id}`)}
                                >
                                    <TableCell className="font-mono text-xs">
                                        <span className="text-primary font-bold">#{order.id}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                        {formatDate(order.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col max-w-[200px]">
                                            <span className="font-medium text-sm truncate">
                                                {order.customer_details?.name || "Unknown"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate italic">
                                                {order.customer_details?.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`rounded-none text-[10px] uppercase tracking-widest font-bold border-0 ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-sm">
                                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        ${parseFloat(order.balance || 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground italic"
                                    >
                                        No custom orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
