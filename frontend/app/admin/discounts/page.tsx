"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    Tag,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchDiscounts } from '@/api/discountApi';
import { toast } from 'sonner';

export default function DiscountList() {
    const router = useRouter();
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            setLoading(true);
            const data = await fetchDiscounts();
            setDiscounts(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Failed to fetch discounts:', error);
            toast.error("Failed to load discounts.");
        } finally {
            setLoading(false);
        }
    };

    const filteredDiscounts = discounts.filter(discount =>
        discount.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (active: boolean, validTo: string) => {
        if (!active) return 'bg-destructive/10 text-destructive border-destructive-200';
        const now = new Date();
        const validUntil = new Date(validTo);
        if (validUntil < now) return 'bg-destructive/10 text-destructive border-destructive-200';
        return 'bg-green-500/10 text-green-500 border-green-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Discounts</h1>
                    <p className="text-muted-foreground mt-1 italic">Manage discounts and promotions.</p>
                </div>
                <Link href="/admin/discounts/new">
                    <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                        <Plus className="mr-2 h-4 w-4" /> Create Discount
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-none border border-border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search codes..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-border rounded-none overflow-hidden bg-card shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px] text-[10px] uppercase tracking-widest font-bold">Code</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Type</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Value</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Usage</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center italic text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="ml-2">Loading discounts...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredDiscounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                    No discounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDiscounts.map((discount) => (
                                <TableRow
                                    key={discount.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/discounts/${discount.id}`)}
                                >
                                    <TableCell className="font-mono font-bold text-primary">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3 w-3 text-muted-foreground" />
                                            {discount.code}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs italic text-muted-foreground">
                                        {discount.discount_type === 'P' ? 'Percentage' : 'Fixed Amount'}
                                    </TableCell>
                                    <TableCell className="font-bold text-sm">
                                        {discount.discount_type === 'F' ? '$' : ''}{discount.value}{discount.discount_type === 'P' ? '%' : ''}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground italic">
                                        {discount.used_count} / {discount.usage_limit || '∞'} used
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${getStatusColor(discount.active, discount.valid_to)}`}>
                                            {discount.active && new Date(discount.valid_to) >= new Date() ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
