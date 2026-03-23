"use client";

import React from 'react';
import Link from 'next/link';

import RouteGuard from '@/components/RouteGuard';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <RouteGuard requireGuest>
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md mb-12 text-center scale-110">
                    <Link href="/" className="text-4xl font-serif font-bold text-foreground tracking-tighter hover:opacity-70 transition-all duration-300 uppercase">
                        Cresbyte
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    {children}
                </div>

                <div className="mt-16 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 space-y-4">
                    <div className="flex justify-center space-x-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-foreground transition-colors">Help</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Cresbyte. All rights reserved.</p>
                </div>
            </div>
        </RouteGuard>
    );
};

export default AuthLayout;
