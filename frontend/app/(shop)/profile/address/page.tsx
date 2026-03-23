"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";
import { MapPin, Plus, Loader2 } from "lucide-react";
import AddressForm from "@/components/address/AddressForm";
import AddressCard from "@/components/address/AddressCard";

export default function Addresses() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialFormState = {
        street_line1: "",
        street_line2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        address_type: "S",
        default: false,
    };

    const [addressFormData, setAddressFormData] = useState(initialFormState);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const response = await api.get("addresses/");
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
            toast.error("Failed to load addresses.");
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    useEffect(() => {
        if (editingAddress) {
            setAddressFormData({
                street_line1: editingAddress.street_line1,
                street_line2: editingAddress.street_line2 || "",
                city: editingAddress.city,
                state_province: editingAddress.state_province,
                postal_code: editingAddress.postal_code,
                country: editingAddress.country,
                address_type: editingAddress.address_type,
                default: editingAddress.default,
            });
            setShowForm(true);
        } else {
            setAddressFormData(initialFormState);
        }
    }, [editingAddress]);

    const handleAddressChange = (updatedData: any) => {
        setAddressFormData(updatedData);
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...addressFormData,
            first_name: user?.first_name || user?.name || "",
            last_name: user?.last_name || "",
        };

        try {
            if (editingAddress) {
                await api.put(`addresses/${editingAddress.id}/`, payload);
                toast.success("Address updated successfully.");
            } else {
                await api.post("addresses/", payload);
                toast.success("Address added successfully.");
            }
            fetchAddresses();
            setEditingAddress(null);
            setShowForm(false);
        } catch (error) {
            console.error("Failed to save address:", error);
            toast.error("Failed to save address. Please check your data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number | string) => {
        setDeleteId(typeof id === "string" ? parseInt(id, 10) : id);
    };

    const executeDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`addresses/${deleteId}/`);
            toast.success("Address deleted successfully.");
            fetchAddresses();
            if (editingAddress && editingAddress.id === deleteId) {
                setEditingAddress(null);
                setShowForm(false);
            }
        } catch (error) {
            console.error("Failed to delete address:", error);
            toast.error("Failed to delete address.");
        } finally {
            setDeleteId(null);
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setAddressFormData(initialFormState);
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingAddress(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Address Book
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your shipping and billing addresses
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={handleAddNew} size="lg" className="rounded-none">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                    </Button>
                )}
            </div>

            {!showForm ? (
                <div className="space-y-6">
                    {loadingAddresses ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Loading addresses...</p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <Card className="border-2 border-dashed rounded-none">
                            <CardContent className="p-12 text-center">
                                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-xl font-semibold mb-2">No Addresses Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Add your first address to make checkout faster and easier.
                                </p>
                                <Button onClick={handleAddNew} className="rounded-none">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Address
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {addresses.map((addr) => (
                                <AddressCard
                                    key={addr.id}
                                    address={addr}
                                    onClick={() => setEditingAddress(addr)}
                                    onEdit={setEditingAddress}
                                    onDelete={confirmDelete}
                                    showActions={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <Card className="border-2 rounded-none">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-2xl">
                                {editingAddress ? "Edit Address" : "Add New Address"}
                            </CardTitle>
                            <CardDescription>
                                {editingAddress
                                    ? "Update your address details below."
                                    : "Enter your address information to save it for future orders."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <AddressForm
                                formData={addressFormData}
                                onChange={handleAddressChange}
                                onSubmit={handleAddressSubmit}
                                onCancel={handleCancel}
                                isSubmitting={isSubmitting}
                                isEditing={!!editingAddress}
                                showAddressType={true}
                                showNames={false}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this address from your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none"
                        >
                            Delete Address
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
