"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AddressFormProps {
    formData: any;
    onChange: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    isEditing?: boolean;
    showAddressType?: boolean;
    showNames?: boolean;
}

const AddressForm = ({
    formData,
    onChange,
    onSubmit,
    onCancel,
    isSubmitting = false,
    isEditing = false,
    showAddressType = true,
    showNames = false
}: AddressFormProps) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        onChange({
            ...formData,
            [id]: type === "checkbox" ? checked : value,
        });
    };

    const handleSelectChange = (value: string) => {
        onChange({ ...formData, address_type: value });
    };

    const handleCheckboxChange = (checked: boolean) => {
        onChange({ ...formData, default: checked });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Names (optional - for checkout) */}
            {showNames && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm font-semibold">
                            First Name *
                        </Label>
                        <Input
                            id="first_name"
                            value={formData.first_name || ""}
                            onChange={handleInputChange}
                            className="h-11"
                            style={{ borderRadius: 0 }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-sm font-semibold">
                            Last Name *
                        </Label>
                        <Input
                            id="last_name"
                            value={formData.last_name || ""}
                            onChange={handleInputChange}
                            className="h-11"
                            style={{ borderRadius: 0 }}
                            required
                        />
                    </div>
                </div>
            )}

            {/* Street Address */}
            <div className="space-y-2">
                <Label htmlFor="street_line1" className="text-sm font-semibold">
                    Street Address *
                </Label>
                <Input
                    id="street_line1"
                    placeholder="123 Main Street"
                    value={formData.street_line1}
                    onChange={handleInputChange}
                    className="h-11"
                    style={{ borderRadius: 0 }}
                    required
                />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
                <Label htmlFor="street_line2" className="text-sm font-semibold">
                    Apartment, Suite, etc. (Optional)
                </Label>
                <Input
                    id="street_line2"
                    placeholder="Apt 4B"
                    value={formData.street_line2}
                    onChange={handleInputChange}
                    className="h-11"
                    style={{ borderRadius: 0 }}
                />
            </div>

            {/* City, State, Postal Code & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold">
                        City *
                    </Label>
                    <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="h-11"
                        style={{ borderRadius: 0 }}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state_province" className="text-sm font-semibold">
                        State / Province *
                    </Label>
                    <Input
                        id="state_province"
                        placeholder="NY"
                        value={formData.state_province}
                        onChange={handleInputChange}
                        className="h-11"
                        style={{ borderRadius: 0 }}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-sm font-semibold">
                        Postal Code *
                    </Label>
                    <Input
                        id="postal_code"
                        placeholder="10001"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="h-11"
                        style={{ borderRadius: 0 }}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold">
                        Country *
                    </Label>
                    <Input
                        id="country"
                        placeholder="United States"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="h-11"
                        style={{ borderRadius: 0 }}
                        required
                    />
                </div>
            </div>

            {/* Address Type & Default */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showAddressType && (
                    <div className="space-y-2">
                        <Label htmlFor="address_type" className="text-sm font-semibold">
                            Address Type *
                        </Label>
                        <Select
                            value={formData.address_type}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger className="h-11" style={{ borderRadius: 0 }}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ borderRadius: 0 }}>
                                <SelectItem value="S">Shipping Address</SelectItem>
                                <SelectItem value="B">Billing Address</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex items-end pb-2">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="default"
                            checked={formData.default}
                            onCheckedChange={handleCheckboxChange}
                            style={{ borderRadius: 0 }}
                        />
                        <Label
                            htmlFor="default"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Set as default address
                        </Label>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="sm:w-auto w-full"
                    style={{ borderRadius: 0 }}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="sm:w-auto w-full"
                    style={{ borderRadius: 0 }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditing ? "Updating..." : "Saving..."}
                        </>
                    ) : (
                        isEditing ? "Update Address" : "Save Address"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AddressForm;
