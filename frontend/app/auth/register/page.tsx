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

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    // Prepare data for backend (excluding confirmPassword)
    const { confirmPassword, ...registerData } = formData;

    const result = await register(registerData);

    if (result.success) {
      router.push(`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`);
    } else {
      const errorMessage = typeof result.error === "object"
        ? Object.values(result.error).flat()[0] as string
        : result.error;
      setError(errorMessage || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-xl font-serif font-bold text-foreground tracking-tighter">
          Create Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join our boutique for exclusive updates and collections
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <div className="bg-destructive/5 text-destructive text-[13px] p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">First Name</Label>
              <Input
                id="first_name"
                placeholder="John"
                className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Doe"
                className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Password</Label>
            <PasswordInput
              id="password"
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
              className="rounded-none border-x-0 border-t-0 border-b-muted-foreground/20 focus-visible:ring-0 focus-visible:border-b-primary transition-all px-0 bg-transparent text-base h-12"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-none mt-4" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-foreground font-black border-b border-foreground/20 hover:border-primary hover:text-primary transition-all ml-1"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
