"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getStaffList } from '@/api/staffApi';

export default function StaffList() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await getStaffList();
                setStaff(data);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const filteredStaff = staff.filter(s => {
        const matchesRole = roleFilter === 'all' || s.role === roleFilter;
        const status = s.is_active ? 'active' : 'inactive';
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesRole && matchesStatus;
    });

    const stats = {
        total: staff.length,
        active: staff.filter(s => s.is_active).length,
        inactive: staff.filter(s => !s.is_active).length,
        admins: staff.filter(s => s.is_superuser).length,
        staffMembers: staff.filter(s => s.is_staff && !s.is_superuser).length,
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? <Badge variant="default" className="rounded-none text-[10px] uppercase tracking-widest font-bold">Active</Badge>
            : <Badge variant="secondary" className="rounded-none text-[10px] uppercase tracking-widest font-bold">Inactive</Badge>;
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, "destructive" | "default" | "secondary"> = {
            Admin: 'destructive',
            Manager: 'default',
            Staff: 'secondary',
        };
        return <Badge variant={variants[role] || 'secondary'} className="rounded-none text-[10px] uppercase tracking-widest font-bold">{role}</Badge>;
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Staff</h1>
                    <p className="text-muted-foreground mt-1 italic">Manage your team members</p>
                </div>
                <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Total Staff</CardDescription>
                        <CardTitle className="text-3xl font-serif">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-green-600">Active</CardDescription>
                        <CardTitle className="text-3xl text-green-600 font-serif">{stats.active}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Inactive</CardDescription>
                        <CardTitle className="text-3xl text-gray-600 font-serif">{stats.inactive}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Admins</CardDescription>
                        <CardTitle className="text-3xl font-serif">{stats.admins}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-none shadow-sm">
                    <CardHeader className="pb-3 border-b mb-2">
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Staff</CardDescription>
                        <CardTitle className="text-3xl font-serif">{stats.staffMembers}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val || 'all')}>
                    <SelectTrigger className="w-[180px] rounded-none shadow-sm font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
                    <SelectTrigger className="w-[180px] rounded-none shadow-sm font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Staff Table */}
            <Card className="rounded-none shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Staff Member</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Role</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Contact</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Join Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center italic text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Loading staff...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center italic text-muted-foreground">
                                        No staff members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="rounded-none border shadow-sm">
                                                    <AvatarFallback className="rounded-none">{getInitials(member.full_name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm font-serif">{member.full_name}</p>
                                                    <p className="text-[10px] text-muted-foreground italic">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getRoleBadge(member.role)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-xs flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {member.email}
                                                </p>
                                                {member.phone_number && (
                                                    <p className="text-xs flex items-center gap-2 text-muted-foreground italic">
                                                        <Phone className="h-3 w-3" />
                                                        {member.phone_number}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(member.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(member.is_active)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/staff/${member.id}`}>
                                                <Button variant="ghost" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                    Details
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {filteredStaff.length === 0 && (
                <div className="text-center py-12 text-muted-foreground italic">
                    <p>No staff members found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
