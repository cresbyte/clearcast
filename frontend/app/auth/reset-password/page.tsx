"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const { confirmPasswordReset } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!uid || !token) {
            setError("Invalid or expired reset link.");
            setStatus("error");
        }
    }, [uid, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!uid || !token) {
            setError("Missing reset credentials. Please request a new link.");
            return;
        }

        setStatus("loading");

        const result = await confirmPasswordReset(uid, token, formData.password);

        if (result.success) {
            setStatus("success");
            // Auto redirect after 3 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } else {
            const errorMessage = typeof result.error === "object"
                ? Object.values(result.error).flat()[0] as string
                : result.error;
            setError(errorMessage || "Failed to reset password. The link might be expired.");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="w-full text-center space-y-6 py-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-serif font-bold text-foreground">Password Reset Successfully</h1>
                    <p className="text-sm text-muted-foreground">
                        Your password has been updated. You will be redirected to the login page shortly.
                    </p>
                </div>
                <Button
                    className="h-12 rounded-none px-8 text-[10px] uppercase tracking-widest font-bold"
                    onClick={() => router.push("/auth/login")}
                >
                    Log In Now
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-10 space-y-3">
                <h1 className="text-xl font-serif font-bold text-foreground tracking-tighter">
                    Set New Password
                </h1>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                    Please enter your new password below to regain access to your boutique account
                </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
                {error && (
                    <div className="bg-destructive/5 text-destructive text-[13px] p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">New Password</Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Confirm Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            autoComplete="new-password"
                            className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-none mt-4"
                    disabled={status === "loading" || (status === "error" && (!uid || !token))}
                >
                    {status === "loading" ? "Resetting Password..." : "Reset Password"}
                </Button>
            </form>

            <div className="mt-12 text-center text-[11px] uppercase tracking-widest text-muted-foreground/60">
                <Link href="/auth/login" className="hover:text-primary transition-colors hover:font-bold">
                    Return to Login
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;
