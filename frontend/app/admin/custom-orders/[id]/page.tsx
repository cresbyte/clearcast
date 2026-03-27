"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trash, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCustomOrderById, createCustomOrder, updateCustomOrder, deleteCustomOrder } from "@/api/orderApi";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function CustomOrderDetail({ params }: { params: Promise<{ id: string }> | any }) {
    const router = useRouter();
    const resolvedParams = React.use(params) as { id: string };
    const orderId = resolvedParams.id;
    const isNew = orderId === "new";
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [order, setOrder] = useState({
        customer_details: { name: "", email: "", phone: "" },
        items: [{ name: "", qty: 1, price: 0 }],
        transaction_details: { payment_method: "", receipt_number: "", notes: "" },
        status: "Pending",
        total_amount: 0,
        balance: 0,
    });

    useEffect(() => {
        if (!isNew) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const data = await fetchCustomOrderById(orderId);
            // Defaulting nested structures safely
            setOrder({
                ...data,
                customer_details: data.customer_details || { name: "", email: "", phone: "" },
                items: Array.isArray(data.items) && data.items.length > 0 ? data.items : [{ name: "", qty: 1, price: 0 }],
                transaction_details: data.transaction_details || { payment_method: "", receipt_number: "", notes: "" }
            });
        } catch (error) {
            console.error("Failed to fetch custom order:", error);
            toast.error("Failed to load order");
            router.push("/admin/custom-orders");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerChange = (field: string, value: string) => {
        setOrder(prev => ({
            ...prev,
            customer_details: { ...prev.customer_details, [field]: value }
        }));
    };

    const handleTransactionChange = (field: string, value: string) => {
        setOrder(prev => ({
            ...prev,
            transaction_details: { ...prev.transaction_details, [field]: value }
        }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...order.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setOrder(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setOrder(prev => ({
            ...prev,
            items: [...prev.items, { name: "", qty: 1, price: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        setOrder(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotals = () => {
        const total = order.items.reduce((sum, item) => sum + (parseFloat(item.price as string) || 0) * (parseInt(item.qty as string) || 1), 0);
        setOrder(prev => ({ ...prev, total_amount: total }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Prepare payload
            const payload = {
                ...order,
                customer_details: order.customer_details,
                items: order.items,
                transaction_details: order.transaction_details
            };
            
            if (isNew) {
                await createCustomOrder(payload);
                toast.success("Order created successfully");
                router.push("/admin/custom-orders");
            } else {
                await updateCustomOrder(orderId, payload);
                toast.success("Order updated successfully");
                loadOrder();
            }
        } catch (error) {
            console.error("Failed to save order:", error);
            toast.error("Failed to save order");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            setSaving(true);
            await deleteCustomOrder(orderId);
            toast.success("Order deleted successfully");
            router.push("/admin/custom-orders");
        } catch (error) {
            console.error("Failed to delete order:", error);
            toast.error("Failed to delete order");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 ">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/custom-orders')} className="rounded-none">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif italic text-primary">
                            {isNew ? 'New Custom Order' : `Order #${orderId}`}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isNew && (
                        <Button variant="destructive" onClick={handleDelete} disabled={saving} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                        Save Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="space-y-4 bg-card p-6 border border-border rounded-none shadow-sm">
                    <h2 className="text-sm uppercase tracking-widest font-bold border-b pb-2">Customer Details</h2>
                    <div className="space-y-3">
                        <div>
                            <Label>Full Name</Label>
                            <Input 
                                value={order.customer_details.name} 
                                onChange={(e) => handleCustomerChange("name", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input 
                                value={order.customer_details.email} 
                                onChange={(e) => handleCustomerChange("email", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="john@example.com"
                                type="email"
                            />
                            <p className="text-xs text-muted-foreground mt-1">If this email doesn't have an account, one will be created automatically.</p>
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input 
                                value={order.customer_details.phone} 
                                onChange={(e) => handleCustomerChange("phone", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="+1 555-555-5555"
                            />
                        </div>
                    </div>
                </div>

                {/* Status and Financials */}
                <div className="space-y-4 bg-card p-6 border border-border rounded-none shadow-sm">
                    <h2 className="text-sm uppercase tracking-widest font-bold border-b pb-2">Status & Financials</h2>
                    <div className="space-y-3">
                        <div>
                            <Label>Order Status</Label>
                            <Select value={order.status} onValueChange={(v) => setOrder({...order, status: v})}>
                                <SelectTrigger className="rounded-none mt-1">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">Changing to Shipped/Delivered will send automated emails.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Total Amount ($)</Label>
                                <Input 
                                    type="number" 
                                    value={order.total_amount} 
                                    onChange={(e) => setOrder({...order, total_amount: parseFloat(e.target.value) || 0})}
                                    className="rounded-none mt-1" 
                                />
                            </div>
                            <div>
                                <Label>Balance Due ($)</Label>
                                <Input 
                                    type="number" 
                                    value={order.balance} 
                                    onChange={(e) => setOrder({...order, balance: parseFloat(e.target.value) || 0})}
                                    className="rounded-none mt-1" 
                                />
                            </div>
                        </div>
                        {order.balance <= 0 && !isNew && (
                            <p className="text-xs text-green-600 font-medium mt-1">Order fully paid (Balance $0). Automated email was sent.</p>
                        )}
                        <Button type="button" variant="outline" onClick={calculateTotals} className="w-full text-xs rounded-none mt-2">
                            Auto-calculate Total from Items
                        </Button>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4 bg-card p-6 border border-border rounded-none shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="text-sm uppercase tracking-widest font-bold">Order Items</h2>
                        <Button type="button" variant="ghost" size="sm" onClick={addItem} className="rounded-none">
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>
                    </div>
                    
                    {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-end bg-muted/20 p-4 border border-border border-dashed">
                            <div className="flex-1">
                                <Label className="text-xs">Item Name/Description</Label>
                                <Input 
                                    value={item.name} 
                                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                    className="rounded-none mt-1" placeholder="Premium Fly Rod" 
                                />
                            </div>
                            <div className="w-24">
                                <Label className="text-xs">Qty</Label>
                                <Input 
                                    type="number" 
                                    value={item.qty} 
                                    onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 1)}
                                    className="rounded-none mt-1" 
                                />
                            </div>
                            <div className="w-32">
                                <Label className="text-xs">Unit Price ($)</Label>
                                <Input 
                                    type="number" 
                                    value={item.price} 
                                    onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                                    className="rounded-none mt-1" 
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="rounded-none text-destructive">
                                <Minus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                 {/* Transaction Details */}
                 <div className="space-y-4 bg-card p-6 border border-border rounded-none shadow-sm md:col-span-2">
                    <h2 className="text-sm uppercase tracking-widest font-bold border-b pb-2">Transaction Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                            <Label>Payment Method</Label>
                            <Input 
                                value={order.transaction_details.payment_method} 
                                onChange={(e) => handleTransactionChange("payment_method", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="Cash, Card, Transfer, etc."
                            />
                        </div>
                        <div>
                            <Label>Receipt Number</Label>
                            <Input 
                                value={order.transaction_details.receipt_number} 
                                onChange={(e) => handleTransactionChange("receipt_number", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="Txn-123456"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea 
                                value={order.transaction_details.notes} 
                                onChange={(e) => handleTransactionChange("notes", e.target.value)}
                                className="rounded-none mt-1" 
                                placeholder="Any additional notes about the transaction..."
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
