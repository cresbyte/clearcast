"use client";

import RouteGuard from '@/components/RouteGuard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";
import {
    Bell,
    ChevronDown,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Monitor,
    Package,
    Percent,
    PhoneCall,
    Search,
    Settings,
    ShoppingCart,
    Star,
    UserCog,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navGroups = [
    {
        label: 'Inventory',
        icon: Package,
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: FolderTree, label: 'Filters', href: '/admin/filters' },
        ]
    },
    {
        label: 'Sales',
        icon: ShoppingCart,
        items: [
            { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
            { icon: PhoneCall, label: 'Custom Orders', href: '/admin/custom-orders' },
            { icon: Percent, label: 'Discounts', href: '/admin/discounts' },
        ]
    },
    {
        label: 'Community',
        icon: Users,
        items: [
            { icon: Users, label: 'Customers', href: '/admin/customers' },
            { icon: Star, label: 'Reviews', href: '/admin/reviews' },
            { icon: Mail, label: 'Messages', href: '/admin/messages' },
        ]
    },
    {
        label: 'Management',
        icon: Settings,
        items: [
            { icon: UserCog, label: 'Staff', href: '/admin/staff' },
            { icon: Monitor, label: 'Landing Page', href: '/admin/content' },
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
            { icon: Mail, label: 'Mail Config', href: '/admin/mail-config' },
        ]
    }
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuth();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href));

    return (
        <RouteGuard requireAdmin>
            <div className="min-h-screen bg-muted/20 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card sticky top-0 z-20 px-4 md:px-6  flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="text-2xl font-bold font-serif tracking-tighter text-primary shrink-0">
                            Clearcast
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            <Link href="/admin">
                                <Button
                                    variant={pathname === '/admin' ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "rounded-none h-10 px-4",
                                        pathname === '/admin' ? "font-medium" : "text-muted-foreground"
                                    )}
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>

                            {navGroups.map((group) => {
                                const isGroupActive = group.items.some(item => isActive(item.href));
                                return (
                                    <DropdownMenu key={group.label}>
                                        <DropdownMenuTrigger
                                            render={
                                                <Button
                                                    variant={isGroupActive ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "rounded-none h-10 px-4",
                                                        isGroupActive ? "font-medium" : "text-muted-foreground"
                                                    )}
                                                >
                                                    <group.icon className="mr-2 h-4 w-4" />
                                                    {group.label}
                                                    <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                                </Button>
                                            }
                                        />
                                        <DropdownMenuContent align="start" className="w-56 rounded-none">
                                            {group.items.map((item) => (
                                                <DropdownMenuItem
                                                    key={item.href}
                                                    render={
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center w-full px-2 py-2 text-sm cursor-pointer",
                                                                isActive(item.href) ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                                                            )}
                                                        />
                                                    }
                                                >
                                                    <item.icon className="mr-3 h-4 w-4" />
                                                    {item.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            })}
                        </nav>
                    </div>

                

                    <div className="flex items-center gap-2 md:gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="p-0 h-9 w-9 md:h-10 md:w-auto md:px-2 flex items-center gap-2 rounded-none">
                                        <Avatar className="h-8 w-8 rounded-none">
                                            <AvatarFallback className="rounded-none bg-primary/10 text-primary text-xs font-bold">
                                                {getInitials(user?.name || user?.first_name || "Admin User")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col items-start text-left">
                                            <p className="text-xs font-medium leading-none">{user?.name || user?.first_name || "Admin"}</p>
                                            <p className="text-[10px] text-muted-foreground leading-none mt-1">{user?.email || "admin@clearcast-fly.com"}</p>
                                        </div>
                                        <ChevronDown className="hidden md:block h-3 w-3 opacity-50" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-56 rounded-none">
                                <DropdownMenuItem
                                    render={
                                        <Link href="/admin/account" className="flex items-center px-2 py-2 text-sm cursor-pointer" />
                                    }
                                >
                                    <Settings className="mr-3 h-4 w-4" /> Account Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <Link href="/" className="flex items-center px-2 py-2 text-sm text-destructive focus:text-destructive cursor-pointer" />
                                    }
                                >
                                    <LogOut className="mr-3 h-4 w-4" /> Return to Store
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Menu Trigger */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger
                                    render={
                                        <Button variant="ghost" size="icon" className="rounded-none">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    }
                                />
                                <SheetContent side="left" className="w-72 p-0 rounded-none">
                                    <div className="flex flex-col h-full bg-card">
                                        <div className="p-6 h-16 flex items-center border-b border-border">
                                            <span className="text-2xl font-bold font-serif tracking-tighter text-primary">Clearcast</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto py-6 px-4">
                                            <nav className="space-y-6">
                                                <div className="px-4">
                                                    <div className="relative w-full">
                                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="search"
                                                            placeholder="Search..."
                                                            className="pl-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-none h-10 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Link href="/admin">
                                                        <Button
                                                            variant={pathname === '/admin' ? "secondary" : "ghost"}
                                                            className={cn(
                                                                "w-full justify-start rounded-none h-11",
                                                                pathname === '/admin' ? "font-medium" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            <LayoutDashboard className="mr-3 h-4 w-4" />
                                                            Dashboard
                                                        </Button>
                                                    </Link>
                                                </div>

                                                {navGroups.map((group) => (
                                                    <div key={group.label} className="space-y-2">
                                                        <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</h4>
                                                        <div className="space-y-1">
                                                            {group.items.map((item) => (
                                                                <Link key={item.href} href={item.href}>
                                                                    <Button
                                                                        variant={isActive(item.href) ? "secondary" : "ghost"}
                                                                        className={cn(
                                                                            "w-full justify-start rounded-none h-10",
                                                                            isActive(item.href) ? "font-medium" : "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <item.icon className="mr-3 h-4 w-4" />
                                                                        {item.label}
                                                                    </Button>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </nav>
                                        </div>
                                        <div className="p-4 border-t border-border">
                                            <Link href="/">
                                                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none">
                                                    <LogOut className="mr-3 h-4 w-4" /> Return to Store
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-(--breakpoint-2xl) mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </RouteGuard>
    );
}
