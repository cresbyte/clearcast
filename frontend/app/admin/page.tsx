"use client";

import { fetchAdminDashboardStats } from '@/api/reviewApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    ArrowRight,
    Clock,
    DollarSign,
    Loader2,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export default function AdminDashboard() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: fetchAdminDashboardStats,
    });

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-destructive">Failed to load dashboard data.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-none">
                    Retry
                </Button>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${Number(stats?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            description: "Total earnings",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Total Orders",
            value: stats?.orders_count || 0,
            icon: ShoppingCart,
            description: "Orders placed",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Active Customers",
            value: stats?.active_customers || 0,
            icon: Users,
            description: "Registered users",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Active Products",
            value: stats?.products_count || 0,
            icon: Package,
            description: "Products in catalog",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
    ];

    const chartData = stats?.monthly_sales || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-serif">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here's what's happening in your store today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                        <Activity className="mr-2 h-4 w-4" />
                        View Reports
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-none ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 italic">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <Card className="col-span-1 lg:col-span-2 shadow-md border-border/50 rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                        <div>
                            <CardTitle className="text-lg font-serif">Recent Orders</CardTitle>
                            <CardDescription className="text-xs italic">
                                Latest transactions from your store
                            </CardDescription>
                        </div>
                        <Link href="/admin/orders">
                            <Button variant="ghost" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order ID</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Customer</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                    <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats?.recent_orders?.length > 0 ? (
                                    stats.recent_orders.map((order: any) => (
                                        <TableRow key={order.order_id}>
                                            <TableCell className="font-medium text-primary font-mono text-xs">
                                                #{order.order_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{order.customer}</span>
                                                    <span className="text-xs text-muted-foreground italic">{order.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                                    ${order.status_code === 'P' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                        order.status_code === 'D' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                            order.status_code === 'S' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
                                                    }
                                                `}>
                                                    {order.status}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-sm">
                                                ${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                            No recent orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Sales Overview Chart */}
                <Card className="col-span-1 shadow-md border-border/50 flex flex-col h-full rounded-none">
                    <CardHeader className="border-b mb-4">
                        <CardTitle className="text-lg font-serif">Sales Overview</CardTitle>
                        <CardDescription className="text-xs italic">Monthly revenue (Last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[250px] p-0 pb-4">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`$${value}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-xs italic">
                                Not enough data for chart
                            </div>
                        )}
                    </CardContent>

                    <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-muted/20">
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Pending</span>
                                <div className="text-xl font-bold flex items-center mt-1 font-serif">
                                    {stats?.pending_orders_count || 0}
                                    <Clock className="ml-2 h-4 w-4 text-yellow-500" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Avg. Order</span>
                                <div className="text-xl font-bold flex items-center mt-1 font-serif">
                                    ${Number(stats?.average_order_value || 0).toLocaleString()}
                                    <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link href="/admin/products/new">
                                <Button className="w-full rounded-none text-[10px] uppercase tracking-widest font-bold" size="sm">
                                    Add New Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
