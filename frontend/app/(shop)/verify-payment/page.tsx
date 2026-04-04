"use client";

import useCartStore from "@/hooks/useCartStore";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VerifyPaymentPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();
    const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
    const [message, setMessage] = useState("Authenticating your settlement...");

    useEffect(() => {
        const reference = searchParams.get("reference") || searchParams.get("trxref");
        if (reference) {
            verifyPayment(reference);
        } else {
            setStatus("failed");
            setMessage("No transaction reference manifested.");
        }
    }, [searchParams]);

    const verifyPayment = async (reference: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/orders/gateways/paystack-verify/?reference=${reference}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.status === "success") {
                setStatus("success");
                setMessage("Acquisition finalized successfully.");
                clearCart();
                setTimeout(() => {
                    router.push("/profile/orders");
                }, 3000);
            } else {
                setStatus("failed");
                setMessage(data.message || "Settlement verification failed.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus("failed");
            setMessage("An error manifested during verification.");
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-white">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                {status === "verifying" && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-black/20" />
                        <h2 className="text-2xl font-serif font-bold tracking-tight">Verifying Settlement</h2>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="h-20 w-20 bg-green-50 flex items-center justify-center mx-auto rounded-full">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold tracking-tight text-green-600">Acquisition Completed</h2>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <div className="h-20 w-20 bg-red-50 flex items-center justify-center mx-auto rounded-full">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold tracking-tight text-red-600">Settlement Error</h2>
                    </>
                )}

                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{message}</p>

                {status !== "verifying" && (
                    <button
                        onClick={() => router.push("/fly-bars")}
                        className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-black border-b border-black pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all"
                    >
                        Return to Collection
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyPaymentPage;
