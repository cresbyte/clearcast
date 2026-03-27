"use client";

import { fetchEmailSettings, updateEmailSettings, testEmailConnection } from "@/api/settingsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Save, Shield, Server, Bell, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MailConfigPage = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchEmailSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch mail settings:", error);
            toast.error("Failed to load mail configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateEmailSettings(settings);
            toast.success("Mail configuration updated successfully");
        } catch (error) {
            console.error("Error saving mail settings:", error);
            toast.error("Failed to update mail configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            const response = await testEmailConnection(settings);
            if (response.success) {
                toast.success(response.message || "Connection successful!");
            } else {
                toast.error(response.message || "Connection failed");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Connection failed";
            toast.error(errorMsg);
        } finally {
            setTesting(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mail Configuration</h1>
                    <p className="text-muted-foreground text-sm">Configure SMTP server settings and administrative notification channels.</p>
                </div>
                <div className="p-2 bg-primary/5 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
            </div>

            <div className="grid gap-6">
                {/* SMTP Server Settings */}
                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-semibold">SMTP Server</CardTitle>
                        </div>
                        <CardDescription>Primary connection details for the mail server.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email_host">SMTP Host</Label>
                                <Input
                                    id="email_host"
                                    placeholder="smtp.example.com"
                                    value={settings?.email_host || ''}
                                onChange={(e) => handleChange('email_host', e.target.value)}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email_port">SMTP Port</Label>
                            <Input
                                id="email_port"
                                type="number"
                                placeholder="587"
                                value={settings?.email_port || ''}
                                onChange={(e) => handleChange('email_port', parseInt(e.target.value))}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email_host_user">SMTP Username</Label>
                                <Input
                                    id="email_host_user"
                                    placeholder="user@example.com"
                                    value={settings?.email_host_user || ''}
                                onChange={(e) => handleChange('email_host_user', e.target.value)}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email_host_password">SMTP Password</Label>
                            <Input
                                id="email_host_password"
                                type="password"
                                placeholder="••••••••"
                                value={settings?.email_host_password || ''}
                                onChange={(e) => handleChange('email_host_password', e.target.value)}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Email Identity & Notifications */}
                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-semibold">Identity & Notifications</CardTitle>
                        </div>
                        <CardDescription>Sender address and administrative alert routing.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="default_from_email">Default From Email</Label>
                                <Input
                                    id="default_from_email"
                                    placeholder="Clearcast Fly <noreply@clearcast.fly>"
                                    value={settings?.default_from_email || ''}
                                onChange={(e) => handleChange('default_from_email', e.target.value)}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notify_email">Admin Notification Email</Label>
                                <Input
                                    id="notify_email"
                                    placeholder="admin@clearcast.fly"
                                    value={settings?.notify_email || ''}
                                onChange={(e) => handleChange('notify_email', e.target.value)}
                                className="rounded-none border-muted focus-visible:ring-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Protocols */}
                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-semibold">Security</CardTitle>
                        </div>
                        <CardDescription>Encryption and transport layer security protocols.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 flex flex-wrap gap-12">
                        <div className="flex items-center space-x-4">
                            <Switch
                                id="email_use_tls"
                                checked={settings?.email_use_tls || false}
                                onCheckedChange={(checked) => handleChange('email_use_tls', checked)}
                            />
                            <Label htmlFor="email_use_tls" className="font-medium cursor-pointer">Use TLS (Recommended for 587)</Label>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Switch
                                id="email_use_ssl"
                                checked={settings?.email_use_ssl || false}
                                onCheckedChange={(checked) => handleChange('email_use_ssl', checked)}
                            />
                            <Label htmlFor="email_use_ssl" className="font-medium cursor-pointer">Use SSL (Recommended for 465)</Label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4 gap-4">
                <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testing || saving}
                    className="h-12 px-10 rounded-none border-primary/20 text-primary hover:bg-primary/5 shadow-sm text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                    {testing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-3" />
                    ) : (
                        <Zap className="h-4 w-4 mr-3" />
                    )}
                    Test Connection
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving || testing}
                    className="h-12 px-10 rounded-none bg-black text-white hover:bg-zinc-800 shadow-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-3" />
                    ) : (
                        <Save className="h-4 w-4 mr-3" />
                    )}
                    Save Configuration
                </Button>
            </div>
        </div>
    );
};

export default MailConfigPage;
