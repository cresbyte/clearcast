"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    User,
    Package,
    Heart,
    Settings,
    LogOut,
    Mailbox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { fetchPendingReviews } from "@/api/reviewApi";

const sidebarItems = [
    { icon: User, label: "Overview", href: "/profile" },
    { icon: Package, label: "Orders", href: "/profile/orders" },
    { icon: Heart, label: "Wishlist", href: "/profile/wishlist" },
    { icon: Mailbox, label: "Address", href: "/profile/address" },
    { icon: Settings, label: "Settings", href: "/profile/settings" },
];

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

    useEffect(() => {
        const loadPendingReviewsCount = async () => {
            try {
                const pending = await fetchPendingReviews();
                setPendingReviewsCount(pending.length);
            } catch (error) {
                console.error("Failed to load pending reviews count:", error);
            }
        };

        if (user) {
            loadPendingReviewsCount();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <RouteGuard requireAuth>
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="space-y-12 sticky top-24">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Member Sanctuary</span>
                                        <h1 className="text-3xl font-serif font-bold tracking-tighter">
                                            {user?.first_name || "Profile"} {user?.last_name || ""}
                                        </h1>
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        {user?.email || ""}
                                    </p>
                                </div>

                                <div className="w-8 h-[1px] bg-black/20" />

                                <nav className="flex flex-col gap-6">
                                    {sidebarItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="group flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <item.icon className={`h-4 w-4 transition-all duration-500 ${isActive ? "text-black" : "text-muted-foreground/20 group-hover:text-black/40"}`} />
                                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? "text-black translate-x-1" : "text-muted-foreground/40 group-hover:text-black"}`}>
                                                        {item.label}
                                                    </span>
                                                </div>

                                                {isActive && (
                                                    <div className="h-[3px] w-[3px] bg-black rounded-full" />
                                                )}

                                                {item.label === "Overview" && pendingReviewsCount > 0 && (
                                                    <span className="text-[9px] font-black bg-black text-white h-5 min-w-[20px] flex items-center justify-center px-1">
                                                        {pendingReviewsCount}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}

                                    <div className="pt-6 border-t border-border/40 mt-4">
                                        <button
                                            className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-destructive transition-all group"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 text-muted-foreground/20 group-hover:text-destructive/40 transition-colors" />
                                            <span className="group-hover:translate-x-1 transition-transform">Relinquish Access</span>
                                        </button>
                                    </div>
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
