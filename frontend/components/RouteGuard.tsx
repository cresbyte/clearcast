"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RouteGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireGuest?: boolean;
    requireAdmin?: boolean;
}

const RouteGuard = ({
    children,
    requireAuth = false,
    requireGuest = false,
    requireAdmin = false
}: RouteGuardProps) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            console.log(user)
            if (requireAuth && !isAuthenticated) {
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (requireGuest && isAuthenticated) {
                router.push('/');
            } else if (requireAdmin && user?.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [isAuthenticated, user, loading, requireAuth, requireGuest, requireAdmin, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    // Prevent rendering if we are about to redirect
    if (requireAuth && !isAuthenticated) return null;
    if (requireGuest && isAuthenticated) return null;
    if (requireAdmin && user?.role !== 'ADMIN') return null;

    return <>{children}</>;
};

export default RouteGuard;
