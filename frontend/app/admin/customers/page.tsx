"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Mail, Filter, Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/api/customerApi";
import { format } from "date-fns";

export default function CustomerList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const {
        data: customerData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["admin", "customers"],
        queryFn: getCustomers,
    });

    const customers = Array.isArray(customerData) ? customerData : (customerData as any)?.results || [];

    const filteredCustomers = customers.filter(
        (customer: any) =>
            customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Customers</h1>
                    <p className="text-muted-foreground mt-1 italic">Manage your customer base.</p>
                </div>
                <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                    <Mail className="mr-2 h-4 w-4" /> Email All
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-none border border-border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search name, email..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="border border-border rounded-none overflow-hidden bg-card shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Customer</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Email</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] uppercase tracking-widest font-bold">Location</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Join Date</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Orders</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Total Spent</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center italic text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span>Loading customers...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-destructive italic">
                                    Error loading customers: {(error as any).message}
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer: any) => (
                                <TableRow
                                    key={customer.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/customers/${customer.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm font-serif">{customer.full_name}</span>
                                            <span className="text-[10px] text-muted-foreground italic">
                                                {customer.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs italic text-muted-foreground">{customer.email}</TableCell>
                                    <TableCell className="hidden md:table-cell text-xs italic text-muted-foreground">
                                        {customer.location || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-xs italic text-muted-foreground">
                                        {customer.created_at ? format(new Date(customer.created_at), "MMM d, yyyy") : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-xs font-bold">{customer.orders_count}</TableCell>
                                    <TableCell className="font-bold text-sm">
                                        ${parseFloat(customer.total_spent || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${customer.is_active
                                                    ? "bg-green-500/10 text-green-500 border-green-200"
                                                    : "bg-red-500/10 text-red-500 border-red-200"
                                                }`}
                                        >
                                            {customer.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
