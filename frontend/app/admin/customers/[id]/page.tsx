"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Mail,
    Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getCustomerDetails, getCustomerOrders } from "@/api/customerApi";
import { fetchAddresses } from "@/api/addressApi";
import AddressCard from "@/components/address/AddressCard";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import RouteGuard from "@/components/RouteGuard";

export default function CustomerDetails({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: customer, isLoading: isLoadingCustomer } = useQuery({
        queryKey: ["admin", "customers", id],
        queryFn: () => getCustomerDetails(id),
    });

    // Depending on your API, this might return `{ results: [] }` or `[]`
    const { data: customerOrdersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ["admin", "customers", id, "orders"],
        queryFn: () => getCustomerOrders(id),
        enabled: !!id,
    });

    const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
        queryKey: ["admin", "customers", id, "addresses"],
        queryFn: () => fetchAddresses(id as any),
        enabled: !!id,
    });

    const customerOrders = Array.isArray(customerOrdersData) ? customerOrdersData : customerOrdersData?.results || [];
    const addresses = Array.isArray(addressesData) ? addressesData : addressesData?.results || [];

    if (isLoadingCustomer || !customer) {
        return (
            <RouteGuard requireAdmin>
                <div className="p-8 text-center text-muted-foreground italic">
                    Loading customer details...
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requireAdmin>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/customers">
                            <Button variant="ghost" size="icon" className="rounded-none">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-serif italic">{customer.full_name}</h1>
                            <p className="text-muted-foreground mt-1">
                                Customer since {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="destructive" className="rounded-none text-[10px] uppercase tracking-widest font-bold">Delete Customer</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="rounded-none border-border/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Total Spent</CardDescription>
                                    <CardTitle className="text-2xl font-serif italic">${parseFloat(customer.total_spent || '0').toFixed(2)}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="rounded-none border-border/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Orders</CardDescription>
                                    <CardTitle className="text-2xl font-serif italic">{customer.orders_count || 0}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="rounded-none border-border/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Status</CardDescription>
                                    <CardTitle className="text-2xl">
                                        <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${customer.is_active ? "bg-green-500/10 text-green-500 border-green-200" : "bg-gray-500/10 text-gray-500 border-gray-200"}`}>
                                            {customer.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Orders Table */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Order History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order ID</TableHead>
                                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Date</TableHead>
                                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingOrders ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                                        Loading orders...
                                                    </TableCell>
                                                </TableRow>
                                            ) : customerOrders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                                        No orders found for this customer.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                customerOrders.map((order: any) => (
                                                    <TableRow
                                                        key={order.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                    >
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            #{order.id}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {order.created_at ? format(new Date(order.created_at), 'PPP') : 'Unknown'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold bg-muted/50">
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold">
                                                            ${parseFloat(order.total_amount || '0').toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Contact Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-lg">
                                        {customer.full_name?.charAt(0) || customer.email?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <p className="font-medium font-serif">{customer.full_name}</p>
                                        <p className="text-sm text-muted-foreground italic">{customer.email}</p>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{customer.phone_number || "+1 (555) 000-0000"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoadingAddresses ? (
                                    <div className="text-center py-4 text-muted-foreground italic">Loading addresses...</div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground text-sm italic border border-dashed border-border/50 p-4 bg-muted/20">
                                        No addresses found for this customer.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((address: any) => (
                                            <div key={address.id} className="border border-border/50 p-4 bg-card rounded-none shadow-sm">
                                                <AddressCard address={address} showActions={false} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
