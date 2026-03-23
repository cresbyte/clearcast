"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Loader2, RefreshCw } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchOrders } from "@/api/orderApi";
import { toast } from "sonner";

export default function OrderList() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchOrders();
            setOrders(Array.isArray(data) ? data : data?.results || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order: any) => {
            const matchesSearch =
                order.id.toString().includes(searchQuery.toLowerCase()) ||
                order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                order.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "P":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
            case "A":
                return "bg-blue-500/10 text-blue-500 border-blue-200";
            case "S":
                return "bg-orange-500/10 text-orange-500 border-orange-200";
            case "D":
                return "bg-green-500/10 text-green-500 border-green-200";
            case "C":
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and fulfill customer orders.
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
                    <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Export Orders
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 ">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders, customers..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                        <SelectTrigger className="w-[180px] rounded-none shadow-sm font-bold text-[10px] uppercase tracking-widest">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="P">Pending</SelectItem>
                            <SelectItem value="A">Paid</SelectItem>
                            <SelectItem value="S">Shipped</SelectItem>
                            <SelectItem value="D">Delivered</SelectItem>
                            <SelectItem value="C">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-border overflow-hidden bg-card rounded-none shadow-md">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 italic text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading orders...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-[10px] uppercase tracking-widest font-bold">Order</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Customer</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                <TableHead className="hidden md:table-cell text-[10px] uppercase tracking-widest font-bold">Items</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order: any) => (
                                <TableRow
                                    key={order.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                >
                                    <TableCell className="font-mono text-xs">
                                        <span className="text-primary font-bold">
                                            #{order.id}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                        {formatDate(order.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col max-w-[200px]">
                                            <span className="font-medium text-sm truncate">
                                                {order.full_name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate italic">
                                                {order.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`rounded-none text-[10px] uppercase tracking-widest font-bold border-0 ${getStatusColor(order.status)}`}
                                        >
                                            {order.status_display}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs italic">
                                        {order.items?.length || 0} item
                                        {(order.items?.length || 0) !== 1 && "s"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-sm">
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground italic"
                                    >
                                        No orders found matching your criteria.
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
