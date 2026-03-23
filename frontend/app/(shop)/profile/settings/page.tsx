"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function Settings() {
    const { user, updateProfile, changePassword } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
    });
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || user.name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setError("");

        const result = await updateProfile(formData);

        if (result.success) {
            setSuccessMessage("Profile updated successfully.");
        } else {
            if (typeof result.error === "object") {
                const firstError = Object.values(result.error).flat()[0];
                setError((firstError as string) || "Update failed");
            } else {
                setError(result.error);
            }
        }
        setLoading(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccessMessage("");
        setPasswordError("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError("New passwords don't match");
            setPasswordLoading(false);
            return;
        }

        const result = await changePassword(passwordData);

        if (result.success) {
            setPasswordSuccessMessage("Password changed successfully.");
            setPasswordData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
        } else {
            if (typeof result.error === "object") {
                const firstError = Object.values(result.error).flat()[0];
                setPasswordError((firstError as string) || "Password change failed");
            } else {
                setPasswordError(result.error);
            }
        }
        setPasswordLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account details and preferences.
                </p>
            </div>

            <div className="space-y-6">
                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {successMessage && (
                                <div className="bg-green-100 text-green-800 p-3 rounded-none flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>{successMessage}</span>
                                </div>
                            )}
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-none flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="rounded-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="rounded-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="rounded-none"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="rounded-none">
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Ensure your account is secure using a long, random password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            {passwordSuccessMessage && (
                                <div className="bg-green-100 text-green-800 p-3 rounded-none flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>{passwordSuccessMessage}</span>
                                </div>
                            )}
                            {passwordError && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-none flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="old_password">Current Password</Label>
                                <PasswordInput
                                    id="old_password"
                                    value={passwordData.old_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <PasswordInput
                                    id="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <PasswordInput
                                    id="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <Button
                                variant="outline"
                                type="submit"
                                disabled={passwordLoading}
                                className="rounded-none"
                            >
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
