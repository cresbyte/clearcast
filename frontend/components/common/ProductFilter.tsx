import React, { useMemo, useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProductFilterProps {
    filterGroups: any[];
    selectedValues: number[];
    onChange: (values: number[]) => void;
    isLoading?: boolean;
    label?: string;
}

const ProductFilter = ({
    filterGroups,
    selectedValues,
    onChange,
    isLoading,
    label = "Filters"
}: ProductFilterProps) => {
    const [open, setOpen] = useState(false);

    const handleToggle = (optionId: number, checked: boolean) => {
        let newSelectedValues = [...selectedValues];
        if (checked) {
            newSelectedValues.push(optionId);
        } else {
            newSelectedValues = newSelectedValues.filter(val => val !== optionId);
        }
        onChange(newSelectedValues);
    };

    const selectedCount = selectedValues.length;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center h-10 px-4 py-2 border border-input rounded-none justify-between gap-2 min-w-[180px] bg-card text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedCount > 0 && "border-primary/50 bg-primary/5"
                )}
            >
                <div className="flex items-center justify-between w-full pointer-events-none">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Filter className={cn("h-4 w-4 shrink-0", selectedCount > 0 && "text-primary")} />
                        <span className="truncate text-[10px] uppercase font-bold tracking-widest">
                            {selectedCount > 0 ? `${selectedCount} Selected` : `All ${label}`}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-72 p-0 max-h-[400px] flex flex-col rounded-none"
                align="start"
            >
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                    {selectedCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange([]);
                            }}
                            className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            <X className="h-3 w-3" /> Clear filters
                        </button>
                    )}
                </div>
                <div className="overflow-y-auto p-2 space-y-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            Loading {label.toLowerCase()}...
                        </div>
                    ) : (filterGroups || []).length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No {label.toLowerCase()} available.
                        </div>
                    ) : (
                        (filterGroups || []).map((group) => (
                            <div key={group.id} className="space-y-2">
                                <h4 className="text-[10px] uppercase font-bold tracking-wider px-2 text-muted-foreground">{group.name}</h4>
                                <div className="space-y-1">
                                    {group.options?.map((option: any) => {
                                        const isChecked = selectedValues.includes(option.id);
                                        return (
                                            <div
                                                key={option.id}
                                                className={cn(
                                                    "flex items-center gap-2 p-1.5 hover:bg-muted/50 transition-colors group cursor-pointer",
                                                    isChecked && "bg-primary/5 hover:bg-primary/10"
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleToggle(option.id, !isChecked);
                                                }}
                                            >
                                                <Checkbox
                                                    id={`filter-${option.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleToggle(option.id, !!checked)}
                                                    className="rounded-none ml-2"
                                                />
                                                <label
                                                    htmlFor={`filter-${option.id}`}
                                                    className="text-xs font-medium leading-none cursor-pointer flex-1 py-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {option.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProductFilter;
