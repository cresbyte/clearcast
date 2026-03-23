"use client";

import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/api/categoryQueries";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ChevronDown, ChevronRight, Edit, Image as ImageIcon, Loader2, Plus, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function CatalogList() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: categories = [], isLoading, isError, error } = useCategories();
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    // Initialize expanded groups when categories are loaded
    React.useEffect(() => {
        if (categories.length > 0 && expandedGroups.size === 0) {
            setExpandedGroups(new Set(categories.map((cat: any) => cat.id)));
        }
    }, [categories]);

    const toggleGroup = (categoryId: number) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedGroups(newExpanded);
    };

    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parent: "" as string,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // List for select options
    const getFlatCategories = () => {
        let result: any[] = [];
        const flatten = (items: any[], level = 0, parentName: string | null = null) => {
            items.forEach((cat) => {
                result.push({ ...cat, level, parentName });
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children, level + 1, cat.name);
                }
            });
        };
        flatten(categories);
        return result;
    };

    const filteredCategories = categories.filter((cat: any) => {
        const matchesQuery = (item: any): boolean => {
            if (!searchQuery) return true;
            const matchesSelf = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesChildren = item.children && item.children.some((child: any) => matchesQuery(child));
            return matchesSelf || matchesChildren;
        };
        return matchesQuery(cat);
    });

    const handleOpenDialog = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || "",
                description: category.description || "",
                parent: category.parent ? category.parent.toString() : "",
            });
            setImagePreview(category.image_url || category.image || null);
            setImageFile(null);
        } else {
            setEditingCategory(null);
            setFormData({
                name: "",
                description: "",
                parent: "",
            });
            setImagePreview(null);
            setImageFile(null);
        }
        setIsDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Category name is required.");
            return;
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('parent', formData.parent || "");
        if (imageFile) {
            submitData.append('image', imageFile);
        }

        if (editingCategory) {
            updateCategoryMutation.mutate(
                { slug: editingCategory.slug, data: submitData },
                {
                    onSuccess: () => {
                        toast.success("Catalog updated successfully.");
                        setIsDialogOpen(false);
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || err.message || "Failed to update catalog");
                    }
                }
            );
        } else {
            createCategoryMutation.mutate(
                submitData,
                {
                    onSuccess: () => {
                        toast.success("Catalog created successfully.");
                        setIsDialogOpen(false);
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || err.message || "Failed to create catalog");
                    }
                }
            );
        }
    };

    const handleDelete = (category: any) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;

        deleteCategoryMutation.mutate(categoryToDelete.slug, {
            onSuccess: () => {
                toast.success(`${categoryToDelete.name} has been deleted.`);
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || err.message || "Failed to delete catalog.");
            }
        });
    };

    if (isError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {(error as any)?.response?.data?.message || "Failed to load catalogs. Please try again."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const renderCategoryRows = (cat: any, level = 0) => {
        const isExpanded = expandedGroups.has(cat.id);
        const hasChildren = cat.children && cat.children.length > 0;

        return (
            <React.Fragment key={cat.id}>
                <TableRow
                    className={`hover:bg-muted/50 cursor-pointer ${level > 0 ? "hover:bg-muted/30 bg-muted/5" : ""}`}
                    onClick={() => hasChildren && toggleGroup(cat.id)}
                >
                    <TableCell>
                        <div className={`rounded-none bg-muted overflow-hidden flex items-center justify-center border ${level > 0 ? "h-8 w-8" : "h-10 w-10"}`}>
                            {cat.image_url || cat.image ? (
                                <img
                                    src={cat.image_url || cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ImageIcon className={`text-muted-foreground ${level > 0 ? "h-3 w-3" : "h-4 w-4"}`} />
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                            {hasChildren ? (
                                isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )
                            ) : (
                                <div className="w-4" />
                            )}
                            {level > 0 && <span className="text-muted-foreground mr-1">↳</span>}
                            <span className={`${level === 0 ? "font-bold font-serif" : "text-sm"}`}>{cat.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs italic">
                        {cat.description || "—"}
                    </TableCell>
                    <TableCell>
                        <Badge variant={level === 0 ? "default" : "secondary"} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                            {level === 0 ? "Root Catalog" : "Subcategory"}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cat)} className="rounded-none">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 rounded-none" onClick={() => handleDelete(cat)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>

                {isExpanded && hasChildren && cat.children.map((child: any) => {
                    const childMatchesSearch = (item: any): boolean => {
                        if (!searchQuery) return true;
                        if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
                        return item.children && item.children.some((c: any) => childMatchesSearch(c));
                    };
                    if (childMatchesSearch(child)) {
                        return renderCategoryRows(child, level + 1);
                    }
                    return null;
                })}
            </React.Fragment>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic">Catalogs</h1>
                    <p className="text-muted-foreground mt-1">Manage your product catalogs and subcategories.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Catalog
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-card">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search catalogs..."
                        className="pl-9 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-border overflow-hidden bg-card rounded-none shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-[10px] uppercase tracking-widest font-bold">Image</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Catalog Name</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Description</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Type</TableHead>
                            <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2 italic">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading catalogs...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                    {searchQuery ? "No catalogs found matching your search." : "No catalogs found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((cat: any) => renderCategoryRows(cat))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-none">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="font-serif">{editingCategory ? "Edit Catalog" : "Add Catalog"}</DialogTitle>
                            <DialogDescription className="italic text-xs">
                                {editingCategory ? "Update the catalog details and image." : "Create a new product catalog or subcategory."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">

                            <div className="flex flex-col items-center gap-4 mb-2">
                                <div className="relative h-32 w-32 rounded-none border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground text-xs italic">
                                            <ImageIcon className="h-8 w-8 mb-1 opacity-50" />
                                            Upload Image
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Click to upload catalog image</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Men's Clothing"
                                    required
                                    className="rounded-none"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="parent" className="text-[10px] uppercase tracking-widest font-bold">Parent Catalog</Label>
                                <Select value={formData.parent || "none"} onValueChange={(val) => setFormData({ ...formData, parent: val === "none" ? "" : String(val || "") })}>
                                    <SelectTrigger className="rounded-none">
                                        <SelectValue>
                                            {formData.parent
                                                ? getFlatCategories().find(c => c.id.toString() === formData.parent)?.name
                                                : "None (Root Catalog)"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="none">None (Root Catalog)</SelectItem>
                                        {getFlatCategories()
                                            .filter(cat => (!editingCategory || (cat.id !== editingCategory.id && cat.slug !== editingCategory.slug)) && cat.level < 2)
                                            .map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {"\u00A0\u00A0".repeat(cat.level)}
                                                    {cat.level > 0 ? `↳ ${cat.name}` : cat.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={3}
                                    className="rounded-none"
                                />
                            </div>

                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} className="rounded-none">
                                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="italic text-xs">
                            This will permanently delete <strong>{categoryToDelete?.name}</strong>.
                            {categoryToDelete?.level === 0 && " This may also delete its subcategories."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none"
                        >
                            {deleteCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
