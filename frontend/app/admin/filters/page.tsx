"use client";

import { 
    useFilters, 
    useCreateFilterGroup, 
    useUpdateFilterGroup, 
    useDeleteFilterGroup,
    useCreateFilterOption,
    useDeleteFilterOption 
} from "@/api/filterQueries";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ChevronDown, ChevronRight, Edit, Loader2, Plus, Search, Trash2, Tag, Layers } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function FiltersList() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: filtersData = [], isLoading, isError, error } = useFilters();
    const filterGroups = Array.isArray(filtersData) ? filtersData : (filtersData as any).results || [];
    
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    // Initialize expanded groups when data is loaded
    React.useEffect(() => {
        if (filterGroups.length > 0 && expandedGroups.size === 0) {
            setExpandedGroups(new Set(filterGroups.map((group: any) => group.id)));
        }
    }, [filterGroups]);

    const toggleGroup = (groupId: number) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const createGroupMutation = useCreateFilterGroup();
    const updateGroupMutation = useUpdateFilterGroup();
    const deleteGroupMutation = useDeleteFilterGroup();
    const createOptionMutation = useCreateFilterOption();
    const deleteOptionMutation = useDeleteFilterOption();

    // Dialog state
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'group' | 'option', data: any } | null>(null);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [targetGroupForOption, setTargetGroupForOption] = useState<any>(null);

    // Form state
    const [groupForm, setGroupForm] = useState<any>({
        name: "",
        description: "",
        image: null,
    });
    const [optionForm, setOptionForm] = useState<any>({
        name: "",
        image: null,
    });

    const handleOpenGroupDialog = (group: any = null) => {
        if (group) {
            setEditingGroup(group);
            setGroupForm({
                name: group.name || "",
                description: group.description || "",
                image: null, // New image if selected
            });
        } else {
            setEditingGroup(null);
            setGroupForm({
                name: "",
                description: "",
                image: null,
            });
        }
        setIsGroupDialogOpen(true);
    };

    const handleOpenOptionDialog = (group: any) => {
        setTargetGroupForOption(group);
        setOptionForm({ 
            name: "",
            image: null,
        });
        setIsOptionDialogOpen(true);
    };

    const handleGroupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupForm.name) return;

        const formData = new FormData();
        formData.append("name", groupForm.name);
        formData.append("description", groupForm.description);
        if (groupForm.image) {
            formData.append("image", groupForm.image);
        }

        if (editingGroup) {
            updateGroupMutation.mutate(
                { slug: editingGroup.slug, data: formData },
                {
                    onSuccess: () => {
                        toast.success("Filter group updated.");
                        setIsGroupDialogOpen(false);
                    },
                    onError: (err: any) => toast.error(err.message || "Failed to update group")
                }
            );
        } else {
            const slug = groupForm.name.toLowerCase().replace(/ /g, '-');
            formData.append("slug", slug);
            createGroupMutation.mutate(
                formData,
                {
                    onSuccess: () => {
                        toast.success("Filter group created.");
                        setIsGroupDialogOpen(false);
                    },
                    onError: (err: any) => toast.error(err.message || "Failed to create group")
                }
            );
        }
    };

    const handleOptionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!optionForm.name || !targetGroupForOption) return;

        const formData = new FormData();
        formData.append("name", optionForm.name);
        formData.append("group", targetGroupForOption.id.toString());
        formData.append("slug", `${targetGroupForOption.slug}-${optionForm.name.toLowerCase().replace(/ /g, '-')}`);
        if (optionForm.image) {
            formData.append("image", optionForm.image);
        }

        createOptionMutation.mutate(
            formData,
            {
                onSuccess: () => {
                    toast.success(`Option "${optionForm.name}" added to ${targetGroupForOption.name}.`);
                    setIsOptionDialogOpen(false);
                },
                onError: (err: any) => toast.error(err.message || "Failed to add option")
            }
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'group') {
            deleteGroupMutation.mutate(deleteTarget.data.slug, {
                onSuccess: () => {
                    toast.success("Group deleted.");
                    setIsDeleteDialogOpen(false);
                }
            });
        } else {
            deleteOptionMutation.mutate(deleteTarget.data.slug, {
                onSuccess: () => {
                    toast.success("Option removed.");
                    setIsDeleteDialogOpen(false);
                }
            });
        }
    };

    if (isError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Product Filters</h1>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load filters. Please check your connection.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif italic">Product Filters</h1>
                    <p className="text-muted-foreground mt-1">Manage filter groups (e.g., Species, Season) and their options (e.g., Bass, Summer).</p>
                </div>
                <Button onClick={() => handleOpenGroupDialog()} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Filter Group
                </Button>
            </div>

            <div className="border border-border overflow-hidden bg-card rounded-none shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[400px] text-[10px] uppercase tracking-widest font-bold">Groups & Options</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Description / Info</TableHead>
                            <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filterGroups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">
                                    No filters found. Go ahead and create your first group!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterGroups.map((group: any) => (
                                <React.Fragment key={group.id}>
                                    <TableRow 
                                        className="bg-muted/10 cursor-pointer hover:bg-muted/20"
                                        onClick={() => toggleGroup(group.id)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {expandedGroups.has(group.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                <div className="h-10 w-10 bg-muted rounded-none overflow-hidden flex-shrink-0 border">
                                                    {group.image ? (
                                                        <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Layers className="h-full w-full p-2 text-primary" />
                                                    )}
                                                </div>
                                                <span className="font-bold font-serif text-lg">{group.name}</span>
                                                <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-tighter">
                                                    {group.options?.length || 0} Options
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground italic">
                                            {group.description || "No description provided."}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-8 rounded-none text-[9px] uppercase font-bold" onClick={() => handleOpenOptionDialog(group)}>
                                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenGroupDialog(group)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                    setDeleteTarget({ type: 'group', data: group });
                                                    setIsDeleteDialogOpen(true);
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedGroups.has(group.id) && (group.options || []).map((option: any) => (
                                        <TableRow key={option.id} className="hover:bg-muted/5">
                                            <TableCell className="pl-12">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-muted rounded-none overflow-hidden flex-shrink-0 border">
                                                        {option.image ? (
                                                            <img src={option.image} alt={option.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Tag className="h-full w-full p-2 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm">{option.name}</span>
                                                    <span className="text-[10px] text-muted-foreground tracking-tighter">({option.slug})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell />
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-destructive" 
                                                    onClick={() => {
                                                        setDeleteTarget({ type: 'option', data: option });
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Group Dialog */}
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent className="rounded-none">
                    <form onSubmit={handleGroupSubmit}>
                        <DialogHeader>
                            <DialogTitle className="font-serif">{editingGroup ? "Edit Filter Group" : "Create Filter Group"}</DialogTitle>
                            <DialogDescription className="text-xs italic">Groups are categories of filters like "Species" or "Season".</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest">Group Image</Label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        className="rounded-none cursor-pointer" 
                                        onChange={e => setGroupForm({...groupForm, image: e.target.files?.[0]})}
                                    />
                                    {editingGroup?.image && !groupForm.image && (
                                        <img src={editingGroup.image} alt="Current" className="h-10 w-10 object-cover border" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest">Group Name *</Label>
                                <Input 
                                    className="rounded-none" 
                                    placeholder="e.g. Fishing Season" 
                                    value={groupForm.name}
                                    onChange={e => setGroupForm({...groupForm, name: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest">Description</Label>
                                <Textarea 
                                    className="rounded-none" 
                                    placeholder="Briefly describe what this group covers..." 
                                    value={groupForm.description}
                                    onChange={e => setGroupForm({...groupForm, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)} className="rounded-none">Cancel</Button>
                            <Button type="submit" className="rounded-none" disabled={createGroupMutation.isPending || updateGroupMutation.isPending}>
                                Save Group
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Option Dialog */}
            <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
                <DialogContent className="rounded-none">
                    <form onSubmit={handleOptionSubmit}>
                        <DialogHeader>
                            <DialogTitle className="font-serif">Add Option to {targetGroupForOption?.name}</DialogTitle>
                            <DialogDescription className="text-xs italic">Add a specific tag like "Summer" or "Trout".</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest">Option Image</Label>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    className="rounded-none cursor-pointer" 
                                    onChange={e => setOptionForm({...optionForm, image: e.target.files?.[0]})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest">Option Name *</Label>
                                <Input 
                                    className="rounded-none" 
                                    placeholder="e.g. Early Spring" 
                                    value={optionForm.name}
                                    onChange={e => setOptionForm({...optionForm, name: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOptionDialogOpen(false)} className="rounded-none">Cancel</Button>
                            <Button type="submit" className="rounded-none" disabled={createOptionMutation.isPending}>
                                Add Option
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            Are you sure you want to delete this {deleteTarget?.type}? 
                            {deleteTarget?.type === 'group' && " This will also delete all associated filter options and remove them from all products."}
                            {deleteTarget?.type === 'option' && " This tag will be removed from all products it's currently assigned to."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
