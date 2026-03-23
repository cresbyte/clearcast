"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { fetchDiscount, createDiscount, updateDiscount, deleteDiscount } from '@/api/discountApi';
import RouteGuard from '@/components/RouteGuard';

export default function DiscountForm() {
    const params = useParams();
    const router = useRouter();

    // Extract ID, safely handling generic array returns
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const isEditMode = !!(id && id !== 'new');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'P',
        value: '',
        min_order_amount: '0',
        usage_limit: '',
        valid_from: '',
        valid_to: '',
        active: true,
        allowed_users: []
    });

    useEffect(() => {
        if (isEditMode) {
            loadDiscount();
        } else {
            // Set default dates
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);

            setFormData((prev: any) => ({
                ...prev,
                valid_from: now.toISOString().slice(0, 16),
                valid_to: nextWeek.toISOString().slice(0, 16)
            }));
        }
    }, [id]);

    const loadDiscount = async () => {
        try {
            setLoading(true);
            const data: any = await fetchDiscount(id as string);
            setFormData({
                ...data,
                valid_from: data.valid_from ? new Date(data.valid_from).toISOString().slice(0, 16) : '',
                valid_to: data.valid_to ? new Date(data.valid_to).toISOString().slice(0, 16) : ''
            });
        } catch (error) {
            console.error('Failed to load discount:', error);
            toast.error("Failed to load discount details");
            router.push('/admin/discounts');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const generateCode = () => {
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData((prev: any) => ({ ...prev, code: randomCode }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (isEditMode) {
                await updateDiscount(id as string, formData);
                toast.success("Discount updated successfully");
            } else {
                await createDiscount(formData);
                toast.success("Discount created successfully");
            }
            router.push('/admin/discounts');
        } catch (error: any) {
            console.error('Failed to save discount:', error);
            toast.error(error.response?.data?.code?.[0] || "Failed to save discount");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this discount?')) return;
        try {
            await deleteDiscount(id as string);
            toast.success("Discount deleted");
            router.push('/admin/discounts');
        } catch (error) {
            toast.error("Failed to delete discount");
        }
    };

    if (loading) {
        return (
            <RouteGuard requireAdmin>
                <div className="flex justify-center py-20">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground italic font-serif">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading discount data...</p>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requireAdmin>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/discounts">
                            <Button variant="ghost" size="icon" type="button" className="rounded-none">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight font-serif italic">{isEditMode ? 'Edit Discount' : 'Create Discount'}</h1>
                            <p className="text-sm text-muted-foreground mt-1">Configure coupon codes and automated rules</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-none">
                        <Label htmlFor="active-switch" className="cursor-pointer text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Active</Label>
                        <Switch
                            id="active-switch"
                            checked={formData.active}
                            className="rounded-none"
                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, active: checked }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic text-xl">Code & Value</CardTitle>
                            <CardDescription>Basic discount information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-[10px] uppercase font-bold tracking-widest">Coupon Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        placeholder="e.g. SUMMER2024"
                                        className="uppercase font-mono rounded-none"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button type="button" variant="outline" className="rounded-none text-[10px] uppercase font-bold tracking-widest" onClick={generateCode}>Generate</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discount_type" className="text-[10px] uppercase font-bold tracking-widest">Type</Label>
                                    <select
                                        id="discount_type"
                                        className="flex h-10 w-full items-center justify-between border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-none dark:bg-input/30"
                                        value={formData.discount_type}
                                        onChange={handleChange}
                                    >
                                        <option value="P" className="bg-background">Percentage (%)</option>
                                        <option value="F" className="bg-background">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value" className="text-[10px] uppercase font-bold tracking-widest">Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        placeholder="0"
                                        className="rounded-none"
                                        value={formData.value}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic text-xl">Usage Limits</CardTitle>
                            <CardDescription>Control when this code can be used.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_order_amount" className="text-[10px] uppercase font-bold tracking-widest">Minimum Order Amount ($)</Label>
                                <Input
                                    id="min_order_amount"
                                    type="number"
                                    className="rounded-none"
                                    value={formData.min_order_amount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usage_limit" className="text-[10px] uppercase font-bold tracking-widest">Total Usage Limit</Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    placeholder="Unlimited"
                                    className="rounded-none"
                                    value={formData.usage_limit}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground italic">Leave 0 or empty for unlimited</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-none border-border/50">
                    <CardHeader>
                        <CardTitle className="font-serif italic text-xl">Active Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="valid_from" className="text-[10px] uppercase font-bold tracking-widest">Valid From</Label>
                                <Input
                                    id="valid_from"
                                    type="datetime-local"
                                    className="rounded-none"
                                    value={formData.valid_from}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="valid_to" className="text-[10px] uppercase font-bold tracking-widest">Valid Until</Label>
                                <Input
                                    id="valid_to"
                                    type="datetime-local"
                                    className="rounded-none"
                                    value={formData.valid_to}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/10 p-4 border border-border/50 rounded-none">
                    <div>
                        {isEditMode && (
                            <Button type="button" variant="destructive" className="rounded-none text-[10px] uppercase font-bold tracking-widest" onClick={handleDelete}>Delete Discount</Button>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Link href="/admin/discounts" className="flex-1 sm:flex-none">
                            <Button type="button" variant="outline" className="w-full rounded-none text-[10px] uppercase font-bold tracking-widest">Discard</Button>
                        </Link>
                        <Button type="submit" disabled={saving} className="flex-1 sm:flex-none rounded-none text-[10px] uppercase font-bold tracking-widest">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update Discount' : 'Create Discount'}
                        </Button>
                    </div>
                </div>
            </form>
        </RouteGuard>
    );
}
