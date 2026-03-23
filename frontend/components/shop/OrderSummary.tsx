"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tag, Truck, Lock, Loader2, X } from 'lucide-react';
import useCartStore from '@/stores/useCartStore';
import { validateDiscount } from '@/api/discountApi';
import { toast } from 'sonner';

interface OrderSummaryProps {
    actionLabel: string;
    onAction: () => void;
    isProcessing?: boolean;
    processingMessage?: string | null;
    showTrustBadges?: boolean;
    className?: string;
}

const OrderSummary = ({
    actionLabel,
    onAction,
    isProcessing = false,
    processingMessage = null,
    showTrustBadges = false,
    className = ""
}: OrderSummaryProps) => {
    const { items, getSubtotal, getShipping, getTotal, setCoupon, clearCoupon, coupon, discount } = useCartStore();
    const [promoCode, setPromoCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');

    const subtotal = getSubtotal();
    const shipping = getShipping();
    const total = getTotal();

    const handleApplyPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode.trim()) return;

        setIsValidating(true);
        setError('');

        try {
            const result = await validateDiscount(promoCode, subtotal);
            if (result.valid) {
                setCoupon(result.coupon);
                setPromoCode('');
                toast.success("Coupon applied successfully!");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Invalid coupon code";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        clearCoupon();
        toast.info("The discount has been removed from your order.");
    };

    return (
        <div className={`space-y-10 sticky top-24 ${className}`}>
            <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold tracking-tighter">Order Summary</h2>
                <div className="w-12 h-[1px] bg-primary" />
            </div>

            <div className="space-y-8">
                {/* Promo Code Section */}
                {!coupon ? (
                    <form onSubmit={handleApplyPromo} className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Promotional Code</span>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter Code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="h-12 flex-1 uppercase text-xs font-bold tracking-widest rounded-none border-border/60 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                                    disabled={items.length === 0}
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-white transition-all duration-500"
                                    disabled={isValidating || items.length === 0 || !promoCode.trim()}
                                >
                                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{error}</p>}
                    </form>
                ) : (
                    <div className="bg-[#F9F9F7] border border-green-500/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-green-700">
                            <Tag className="h-4 w-4" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-widest">{coupon.code}</span>
                                <span className="text-[10px] font-medium opacity-60">
                                    {coupon.discount_type === 'P' ? `${coupon.value}%` : `$${coupon.value}`} Discount Applied
                                </span>
                            </div>
                        </div>
                        <button
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            onClick={handleRemoveCoupon}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.1em] font-bold">
                        <span className="text-muted-foreground/60">Subtotal</span>
                        <span className="text-foreground">${Number(subtotal).toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.1em] font-bold text-green-600">
                            <span className="flex items-center gap-2">Discount</span>
                            <span className="">-${Number(discount).toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.1em] font-bold">
                        <span className="text-muted-foreground/60">Shipping</span>
                        <span className="text-foreground">
                            {shipping === 0 ? (
                                <span className="text-primary tracking-widest font-black">Complimentary</span>
                            ) : (
                                `$${Number(shipping).toFixed(2)}`
                            )}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.1em] font-bold">
                        <span className="text-muted-foreground/60">Estimated Tax</span>
                        <span className="text-muted-foreground/40 italic font-medium font-serif lowercase tracking-tight">Calculated at completion</span>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex justify-between items-baseline">
                        <span className="text-[13px] font-black uppercase tracking-[0.2em]">Total</span>
                        <span className="text-3xl font-serif font-bold text-foreground">
                            ${Number(total).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="space-y-6 pt-4">
                    <Button
                        onClick={onAction}
                        disabled={isProcessing || items.length === 0}
                        className="w-full h-14 text-[11px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/5 transition-all duration-500"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{processingMessage || "Securing Order..."}</span>
                            </div>
                        ) : actionLabel}
                    </Button>

                    {className.includes('checkout') && (
                        <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
                            By finalizing purchase, you acknowledge our <br />
                            <span className="underline cursor-pointer hover:text-primary transition-colors">Terms of Luxury Service</span>
                        </p>
                    )}
                </div>

                {/* Trust Badges */}
                {showTrustBadges && (
                    <div className="pt-10 grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-3 border border-border/30">
                            <Truck className="h-4 w-4 text-primary/60 shrink-0" />
                            <span className="text-[9px] uppercase tracking-[0.1em] font-black text-muted-foreground/60 leading-tight">Fast Worldwide <br />Shipping</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-border/30">
                            <Lock className="h-4 w-4 text-primary/60 shrink-0" />
                            <span className="text-[9px] uppercase tracking-[0.1em] font-black text-muted-foreground/60 leading-tight">Encrypted <br />Checkout</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
