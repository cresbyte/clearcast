"use client";

import { useAdminProducts, useDeleteProduct } from "@/api/adminProductApi";
import { useCategories } from "@/api/categoryQueries";
import CategoryFilter from "@/components/common/CategoryFilter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, Filter, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProductList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    // Categories for catalog filter
    const { data: categoriesData = [], isLoading: isLoadingCategories } = useCategories();
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any).results || [];

    const flatCategories = useMemo(() => {
        const result: any[] = [];
        const flatten = (items: any[], level = 0) => {
            items.forEach((cat) => {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children, level + 1);
                }
            });
        };
        flatten(categories);
        return result;
    }, [categories]);

    // Fetch products with search filter
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, error } = useAdminProducts({
        search: searchQuery,
        page: page,
        category_id: selectedCategories.length > 0 ? selectedCategories : undefined,
    });

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedCategories]);

    const products = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / 10); // Assuming page size 10

    const deleteProductMutation = useDeleteProduct();

    const handleDelete = (e: React.MouseEvent, slug: string, name: string) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteProductMutation.mutate(
                { slug, hard: false },
                {
                    onSuccess: () => {
                        toast.success(`${name} has been deleted successfully.`);
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to delete product");
                    },
                }
            );
        }
    };

    if (isError) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-serif italic">Products</h1>
                        <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
                    </div>
                    <Link href="/admin/products/new">
                        <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                <Alert variant="destructive" className="rounded-none">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {(error as any)?.response?.data?.message || "Failed to load products. Please try again."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <CategoryFilter
                        categories={categories}
                        selectedValues={selectedCategories}
                        onChange={setSelectedCategories}
                        isLoading={isLoadingCategories}
                    />
                    <Button
                        variant="outline"
                        className="hidden sm:flex rounded-none text-[10px] uppercase tracking-widest font-bold"
                        onClick={() => {
                            setSelectedCategories([]);
                            setSearchQuery("");
                        }}
                    >
                        <Filter className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </div>
            </div>

            <div className="border border-border overflow-hidden bg-card rounded-none shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] hidden sm:table-cell text-[10px] uppercase tracking-widest font-bold">
                                Image
                            </TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Name</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] uppercase tracking-widest font-bold">Category</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Qty</TableHead>
                            <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground italic"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading products...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground italic"
                                >
                                    {searchQuery ? "No products found matching your search." : "No products found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow
                                    key={product.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/products/${product.slug}`)}
                                >
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="h-10 w-10 rounded-none bg-muted overflow-hidden border">
                                            {product.primary_image ? (
                                                <img
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground italic">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <span className="font-serif">{product.name}</span>
                                        <div className="text-[10px] text-muted-foreground sm:hidden italic">
                                            {product.category?.name || 'Uncategorized'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="secondary" className="font-normal rounded-none text-[10px]">
                                            {product.category?.name || 'Uncategorized'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${product.is_active
                                                ? "bg-green-500/10 text-green-500 border-green-200"
                                                : "bg-gray-500/10 text-gray-500 border-gray-200"
                                                }`}
                                        >
                                            {product.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-left font-bold ${product.stock_quantity < 20 ? "text-red-500" : ""}`}>
                                        {product.stock_quantity}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {product.price_range && product.price_range.min !== product.price_range.max ? (
                                            <span>
                                                ${Number(product.price_range.min).toFixed(2)} - ${Number(product.price_range.max).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span>${Number(product.base_price).toFixed(2)}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {isLoading ? (
                        "Loading..."
                    ) : (
                        `Showing ${products.length} of ${totalCount} products`
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                        onClick={() => setPage(p => (page < totalPages ? p + 1 : p))}
                        disabled={page >= totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
