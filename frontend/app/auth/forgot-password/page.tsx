"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await resetPassword(email);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      const errorMessage = typeof result.error === "object"
        ? Object.values(result.error).flat()[0] as string
        : result.error;
      setError(errorMessage || "Failed to send reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-xl font-serif font-bold text-foreground tracking-tighter">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          We will send you a link to reset your password via email
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-primary/5 text-primary text-[13px] p-6 font-medium">
            Check your email for a reset link.
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-none border-muted-foreground/20 hover:bg-muted/50 text-[10px] uppercase tracking-widest font-bold shadow-none transition-all px-8"
            onClick={() => setIsSubmitted(false)}
          >
            Send another link
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-destructive/5 text-destructive text-[13px] p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-none" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
