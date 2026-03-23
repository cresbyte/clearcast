import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Check, Home, Building2 } from "lucide-react";

interface Address {
    id: string | number;
    address_type: string;
    default: boolean;
    street_line1: string;
    street_line2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
}

interface AddressCardProps {
    address: Address;
    onEdit?: (address: Address) => void;
    onDelete?: (id: string | number) => void;
    onClick?: () => void;
    showActions?: boolean;
}

const AddressCard = ({
    address,
    onEdit,
    onDelete,
    onClick,
    showActions = true
}: AddressCardProps) => {
    return (
        <Card
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${address.default ? 'border-primary border-2' : 'border hover:border-primary'
                }`}
            style={{ borderRadius: 0 }}
            onClick={onClick}
        >
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {address.address_type === "B" ? (
                            <Building2 className="h-5 w-5 text-primary" />
                        ) : (
                            <Home className="h-5 w-5 text-primary" />
                        )}
                        <span className="font-bold text-lg uppercase tracking-wide">
                            {address.address_type === "B" ? "Billing" : "Shipping"}
                        </span>
                    </div>
                    {address.default && (
                        <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold" style={{ borderRadius: 0 }}>
                            <Check className="h-3 w-3" />
                            DEFAULT
                        </div>
                    )}
                </div>

                {/* Address Details */}
                <div className="text-sm text-muted-foreground space-y-1 mb-4 min-h-[100px]">
                    <p className="font-medium text-foreground">{address.street_line1}</p>
                    {address.street_line2 && <p>{address.street_line2}</p>}
                    <p>{address.city}, {address.state_province} {address.postal_code}</p>
                    <p className="font-medium">{address.country}</p>
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            style={{ borderRadius: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(address);
                            }}
                        >
                            <Edit2 className="mr-2 h-3 w-3" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                            style={{ borderRadius: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(address.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AddressCard;
