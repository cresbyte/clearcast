"use client";

import React from "react";
import Link from "next/link";
import {
    Mail,
    Phone,
    Calendar,
    Shield,
    Activity,
    ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function AdminAccount() {
    const { user } = useAuth();

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, "destructive" | "default" | "secondary"> = {
            Admin: "destructive",
            Manager: "default",
            Staff: "secondary",
        };
        return <Badge variant={variants[role] || "secondary"} className="rounded-none text-[10px] uppercase tracking-widest font-bold">{role || "Staff"}</Badge>;
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="rounded-none">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight font-serif italic text-primary">My Account</h1>
                    <p className="text-muted-foreground text-sm italic">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="font-serif">Profile Information</CardTitle>
                            <CardDescription className="text-xs italic">
                                Your personal details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 rounded-none border shadow-sm">
                                    <AvatarFallback className="text-2xl rounded-none">
                                        {getInitials(user.name || user.first_name || "Admin User")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold font-serif">{user.name || user.first_name}</h2>
                                    <p className="text-muted-foreground text-xs italic">{user.role || "Administrator"}</p>
                                </div>
                                <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">Change Photo</Button>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold">Full Name</Label>
                                    <Input id="name" defaultValue={user.name || user.first_name} className="rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold">Email</Label>
                                    <Input id="email" type="email" defaultValue={user.email} className="rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        className="rounded-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">Cancel</Button>
                                <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="font-serif">Security</CardTitle>
                            <CardDescription className="text-xs italic">
                                Manage your password and security settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password" className="text-[10px] uppercase tracking-widest font-bold">Current Password</Label>
                                <Input id="current-password" type="password" className="rounded-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-[10px] uppercase tracking-widest font-bold">New Password</Label>
                                <Input id="new-password" type="password" className="rounded-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-[10px] uppercase tracking-widest font-bold">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" className="rounded-none" />
                            </div>
                            <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold mt-4 shadow-sm">Update Password</Button>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="flex items-center gap-2 font-serif text-lg">
                                <Activity className="h-5 w-5 text-primary" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-xs italic">
                                Your latest actions in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { title: "Logged in from new device", time: "2 hours ago" },
                                    { title: "Updated product inventory", time: "5 hours ago" },
                                    { title: "Approved 3 customer reviews", time: "1 day ago" }
                                ].map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{activity.title}</p>
                                            <p className="text-[10px] text-muted-foreground italic">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Role & Permissions */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="flex items-center gap-2 font-serif text-lg">
                                <Shield className="h-5 w-5 text-primary" />
                                Role & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-center pb-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Your Role</p>
                                {getRoleBadge(user.role)}
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Account Status</p>
                                <p className="font-bold text-xs italic text-green-600">Active / Restricted Access</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Details */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="font-serif text-lg">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase tracking-widest font-bold">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </p>
                                <p className="font-medium text-xs truncate italic">{user.email}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase tracking-widest font-bold">
                                    <Calendar className="h-3 w-3" />
                                    Member Since
                                </p>
                                <p className="font-medium text-xs italic">{formatDate(user.date_joined || "2024-01-01")}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">User ID</p>
                                <p className="font-mono text-[10px] text-muted-foreground break-all italic">{user.id || "ADMIN-001"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="border-b mb-4">
                            <CardTitle className="font-serif text-lg">Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                Notification Settings
                            </Button>
                            <Button variant="outline" className="w-full justify-start rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                Display Preferences
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}