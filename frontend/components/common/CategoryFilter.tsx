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

interface CategoryFilterProps {
    categories: any[];
    selectedValues: any[];
    onChange: (values: any[]) => void;
    isLoading?: boolean;
    valueKey?: string;
    label?: string;
}

const CategoryFilter = ({
    categories,
    selectedValues,
    onChange,
    isLoading,
    valueKey = "id",
    label = "Catalogs"
}: CategoryFilterProps) => {
    const [open, setOpen] = useState(false);

    // Flatten categories for display while keeping track of hierarchy
    const flatCategories = useMemo(() => {
        const result: any[] = [];
        const flatten = (items: any[], level = 0, parentId: any = null) => {
            items.forEach((cat: any) => {
                result.push({ ...cat, level, parentId });
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children, level + 1, cat.id);
                }
            });
        };
        flatten(categories || []);
        return result;
    }, [categories]);

    const getDescendantValuesRecursively = (node: any) => {
        let values: any[] = [];
        if (node.children) {
            node.children.forEach((child: any) => {
                values.push(child[valueKey]);
                values.push(...getDescendantValuesRecursively(child));
            });
        }
        return values;
    };

    const handleToggle = (catValue: any, checked: boolean) => {
        let newSelectedValues = [...selectedValues];

        // Find the category in the hierarchical structure to get its children
        const findInTree = (nodes: any[], val: any): any => {
            for (const node of nodes) {
                if (node[valueKey] === val) return node;
                if (node.children) {
                    const found = findInTree(node.children, val);
                    if (found) return found;
                }
            }
            return null;
        };

        const catInTree = findInTree(categories || [], catValue);
        const descendantValues = catInTree ? getDescendantValuesRecursively(catInTree) : [];

        if (checked) {
            // Add current value and all descendant values
            newSelectedValues = Array.from(new Set([...newSelectedValues, catValue, ...descendantValues]));
        } else {
            // Remove current value and all descendant values
            const valuesToRemove = [catValue, ...descendantValues];
            newSelectedValues = newSelectedValues.filter((val) => !valuesToRemove.includes(val));
        }

        onChange(newSelectedValues);
    };

    const selectedCount = selectedValues.length;
    const displayLabel = useMemo(() => {
        if (selectedCount === 0) return `All ${label.toLowerCase()}`;
        if (selectedCount === 1) {
            const cat = flatCategories.find((c) => c[valueKey] === selectedValues[0]);
            return cat ? cat.name : `1 ${label.toLowerCase()}`;
        }
        return `${selectedCount} ${label.toLowerCase()}`;
    }, [selectedCount, selectedValues, flatCategories, valueKey, label]);

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
                            {displayLabel}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-72 p-0 max-h-[400px] flex flex-col"
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
                <div className="overflow-y-auto p-2 space-y-0.5">
                    {isLoading ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            Loading {label.toLowerCase()}...
                        </div>
                    ) : flatCategories.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No {label.toLowerCase()} available.
                        </div>
                    ) : (
                        flatCategories.map((cat) => {
                            const catValue = cat[valueKey];
                            const isChecked = selectedValues.includes(catValue);

                            return (
                                <div
                                    key={catValue}
                                    className={cn(
                                        "flex items-center gap-2 p-1.5 hover:bg-muted/50 transition-colors group cursor-pointer",
                                        isChecked && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleToggle(catValue, !isChecked);
                                    }}
                                >
                                    <div
                                        className="flex items-center cursor-pointer"
                                        style={{ marginLeft: `${cat.level * 16}px` }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            id={`cat-${catValue}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => handleToggle(catValue, !!checked)}
                                        />
                                    </div>
                                    <label
                                        htmlFor={`cat-${catValue}`}
                                        className="text-xs font-medium leading-none cursor-pointer flex-1 truncate py-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {cat.level > 0 && <span className="text-muted-foreground mr-1">↳</span>}
                                        {cat.name}
                                    </label>
                                </div>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CategoryFilter;
