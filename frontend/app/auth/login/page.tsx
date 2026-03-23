"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push(redirect);
    } else {
      const errorMessage = typeof result.error === "object"
        ? Object.values(result.error).flat()[0] as string
        : result.error;
      setError(errorMessage || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-xl font-serif font-bold text-foreground tracking-tighter">
          Login
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to access your boutique account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-destructive/5 text-destructive text-[13px] p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <PasswordInput
              id="password"
              className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-none" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-12 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-white px-4 text-muted-foreground/40 font-medium">
              Social Login
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-none border-muted-foreground/20 hover:bg-muted/50 text-[10px] uppercase tracking-widest font-bold shadow-none transition-all">Google</Button>
          <Button variant="outline" className="h-12 rounded-none border-muted-foreground/20 hover:bg-muted/50 text-[10px] uppercase tracking-widest font-bold shadow-none transition-all">Apple</Button>
        </div>

        <p className="text-[13px] text-muted-foreground">
          New to our boutique?{" "}
          <Link
            href={`/auth/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-foreground font-black border-b border-foreground/20 hover:border-primary hover:text-primary transition-all ml-1"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
