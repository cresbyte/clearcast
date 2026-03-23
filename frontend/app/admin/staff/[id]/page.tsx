"use client";

import { deleteStaff, getStaffDetails, registerStaff, updateStaff } from '@/api/staffApi';
import RouteGuard from '@/components/RouteGuard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, CheckCircle, ChevronLeft, Loader2, Mail, Phone, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StaffForm({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const isEditMode = !!(id && id !== 'new');

    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(isEditMode);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(!isEditMode);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        is_active: true,
        is_staff: true,
        is_superuser: false
    });

    // Password Reset State
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const data = await getStaffDetails(id);
                    setMember(data);
                    setFormData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        phone_number: data.phone_number || '',
                        password: '',
                        is_active: data.is_active ?? true,
                        is_staff: data.is_staff ?? true,
                        is_superuser: data.is_superuser ?? false
                    });
                } catch (error) {
                    console.error("Failed to fetch staff details:", error);
                    toast.error("Failed to load staff details");
                    router.push('/admin/staff');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id, isEditMode, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordData(prev => ({ ...prev, [id]: value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess('');
        setProfileError('');

        try {
            if (isEditMode) {
                const updated = await updateStaff(id, formData);
                setMember(updated);
                setProfileSuccess('Profile updated successfully');
                setTimeout(() => setIsEditing(false), 2000);
            } else {
                if (!formData.password) {
                    setProfileError("Password is required for new staff members");
                    setProfileLoading(false);
                    return;
                }
                const newMember = await registerStaff(formData);
                toast.success('Staff member created successfully');
                router.push(`/admin/staff/${newMember.id}`);
            }
        } catch (err: any) {
            const msg = err.response?.data ? Object.values(err.response.data).flat()[0] : 'Operation failed';
            setProfileError(msg as string);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError("Passwords don't match");
            return;
        }

        setPasswordLoading(true);
        setPasswordSuccess('');
        setPasswordError('');

        try {
            await updateStaff(id, { password: passwordData.new_password });
            setPasswordSuccess('Password reset successfully');
            setPasswordData({ new_password: '', confirm_password: '' });
            setTimeout(() => setIsResettingPassword(false), 2000);
        } catch (err: any) {
            const msg = err.response?.data ? Object.values(err.response.data).flat()[0] : 'Password reset failed';
            setPasswordError(msg as string);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (confirm('Are you sure you want to deactivate this staff member?')) {
            try {
                const updated = await updateStaff(id, { is_active: false });
                setMember(updated);
                setFormData(prev => ({ ...prev, is_active: false }));
                toast.success("Staff member deactivated");
            } catch (err) {
                toast.error('Deactivation failed');
            }
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
            try {
                await deleteStaff(id);
                toast.success("Staff member deleted");
                router.push('/admin/staff');
            } catch (err) {
                toast.error('Deletion failed');
            }
        }
    };

    if (loading) {
        return (
            <RouteGuard requireAdmin>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground italic font-serif">Loading staff details...</p>
                </div>
            </RouteGuard>
        );
    }

    if (isEditMode && !member) {
        return (
            <RouteGuard requireAdmin>
                <div className="text-center py-20">
                    <p className="text-muted-foreground font-serif italic mb-4">Staff member not found</p>
                    <Link href="/admin/staff">
                        <Button className="rounded-none text-[10px] uppercase font-bold tracking-widest">Back to Staff</Button>
                    </Link>
                </div>
            </RouteGuard>
        );
    }

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getRoleBadge = (role: string) => {
        if (!role) return <Badge variant="secondary" className="rounded-none text-[10px] uppercase tracking-widest font-bold">Staff</Badge>;

        const variants: Record<string, string> = {
            Admin: 'destructive bg-red-600/10 text-red-600 border-red-200',
            Manager: 'default',
            Staff: 'secondary',
        };
        const variantClass = variants[role] || 'secondary';

        return <Badge className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${variantClass}`} variant={variantClass as any}>{role}</Badge>;
    };

    return (
        <RouteGuard requireAdmin>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/staff">
                            <Button variant="ghost" size="icon" className="rounded-none">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-serif italic">
                                {isEditMode ? 'Staff Details' : 'Add Staff Member'}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                {isEditMode ? 'Manage staff member information' : 'Create a new staff account'}
                            </p>
                        </div>
                    </div>
                    {isEditMode && (
                        <Button
                            variant={isEditing ? "destructive" : "outline"}
                            className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Cancel" : "Edit Details"}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information */}
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic text-xl">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        {profileSuccess && (
                                            <div className="bg-green-500/10 text-green-600 border border-green-200 p-3 flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{profileSuccess}</span>
                                            </div>
                                        )}
                                        {profileError && (
                                            <div className="bg-destructive/10 text-destructive border border-destructive/20 text-sm p-3 flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{profileError}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name" className="text-[10px] uppercase font-bold tracking-widest">First Name</Label>
                                                <Input id="first_name" className="rounded-none" value={formData.first_name} onChange={handleInputChange} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name" className="text-[10px] uppercase font-bold tracking-widest">Last Name</Label>
                                                <Input id="last_name" className="rounded-none" value={formData.last_name} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest">Email Address</Label>
                                            <Input id="email" type="email" className="rounded-none" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number" className="text-[10px] uppercase font-bold tracking-widest">Phone Number</Label>
                                            <Input id="phone_number" className="rounded-none" value={formData.phone_number} onChange={handleInputChange} />
                                        </div>

                                        {!isEditMode && (
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-widest">Initial Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="rounded-none"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-4">
                                            {isEditMode && (
                                                <Button type="button" variant="ghost" className="rounded-none text-[10px] uppercase tracking-widest font-bold" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            )}
                                            <Button type="submit" disabled={profileLoading} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isEditMode ? 'Save Changes' : 'Create Staff Member'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-20 w-20 rounded-none border border-border/50">
                                                <AvatarFallback className="text-2xl font-serif italic bg-muted rounded-none">
                                                    {getInitials(member.full_name || `${member.first_name} ${member.last_name}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h2 className="text-2xl font-bold font-serif">{member.full_name || `${member.first_name} ${member.last_name}`}</h2>
                                                <p className="text-muted-foreground italic text-sm mt-1">{member.is_superuser ? 'Management' : 'Staff'}</p>
                                            </div>
                                        </div>

                                        <Separator className="border-border/50" />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/10 p-4 border border-border/50">
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    Email
                                                </p>
                                                <p className="font-medium italic">{member.email}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    Phone
                                                </p>
                                                <p className="font-medium italic">{member.phone_number || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-2 col-span-1 sm:col-span-2">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    Join Date
                                                </p>
                                                <p className="font-medium italic">{formatDate(member.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {isResettingPassword && isEditMode && (
                            <Card className="rounded-none border-border/50">
                                <CardHeader>
                                    <CardTitle className="font-serif italic text-xl">Reset Password</CardTitle>
                                    <CardDescription>Set a new password for this staff member.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        {passwordSuccess && (
                                            <div className="bg-green-500/10 text-green-600 border border-green-200 p-3 flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{passwordSuccess}</span>
                                            </div>
                                        )}
                                        {passwordError && (
                                            <div className="bg-destructive/10 text-destructive border border-destructive/20 text-sm p-3 flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{passwordError}</span>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password" className="text-[10px] uppercase font-bold tracking-widest">New Password</Label>
                                            <Input type="password" id="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className="rounded-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm_password" className="text-[10px] uppercase font-bold tracking-widest">Confirm New Password</Label>
                                            <Input type="password" id="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} className="rounded-none" required />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button type="button" variant="ghost" className="rounded-none text-[10px] uppercase font-bold tracking-widest" onClick={() => setIsResettingPassword(false)}>Cancel</Button>
                                            <Button type="submit" disabled={passwordLoading} className="rounded-none text-[10px] uppercase font-bold tracking-widest">
                                                {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Reset Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-8">
                        {isEditMode && member && (
                            <>
                                {/* Role & Status */}
                                <Card className="rounded-none border-border/50">
                                    <CardHeader>
                                        <CardTitle className="font-serif italic">Role & Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</p>
                                            <div>{getRoleBadge(member.role || (member.is_superuser ? 'Admin' : 'Staff'))}</div>
                                        </div>
                                        <Separator className="border-border/50" />
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                                            <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${member.is_active ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-muted text-muted-foreground'}`}>
                                                {member.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Permissions */}
                                <Card className="rounded-none border-border/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-serif italic text-base">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            Access Level
                                        </CardTitle>
                                        <CardDescription>System access rights</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="rounded-none bg-muted/50 border-border/50 font-mono text-xs">
                                                    {member.is_superuser ? 'is_superuser : true' : 'is_superuser : false'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="rounded-none bg-muted/50 border-border/50 font-mono text-xs">
                                                    {member.is_staff ? 'is_staff : true' : 'is_staff : false'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="rounded-none border-border/50">
                                    <CardHeader>
                                        <CardTitle className="font-serif italic">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start rounded-none text-[10px] font-bold uppercase tracking-widest">
                                            Send Email
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start rounded-none text-[10px] font-bold uppercase tracking-widest" onClick={() => setIsResettingPassword(true)}>
                                            Reset Password
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Danger Zone */}
                                <Card className="rounded-none border-destructive/30 bg-destructive/5">
                                    <CardHeader>
                                        <CardTitle className="text-destructive font-serif italic text-base">Danger Zone</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {member.is_active && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start rounded-none text-[10px] font-bold uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10"
                                                onClick={handleDeactivate}
                                            >
                                                Deactivate Account
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-start rounded-none text-[10px] font-bold uppercase tracking-widest"
                                            onClick={handleDelete}
                                        >
                                            Delete Staff Member
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
