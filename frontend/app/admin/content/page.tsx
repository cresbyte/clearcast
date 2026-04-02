"use client";

import React, { useState } from 'react';
import { useHeroSections, useNavbarPromos, useContentSections, useShopByCatalogSections, contentApi } from '@/api/contentApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useFilters } from '@/api/filterQueries';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function ContentManagement() {
    const queryClient = useQueryClient();
    const { data: heroData, isLoading: heroLoading } = useHeroSections();
    const { data: promosData, isLoading: promosLoading } = useNavbarPromos();
    const { data: sectionsData, isLoading: sectionsLoading } = useContentSections();
    const { data: shopByData, isLoading: shopByLoading } = useShopByCatalogSections();

    const heroSections = (heroData as any)?.results || heroData || [];
    const promos = (promosData as any)?.results || promosData || [];
    const contentSections = (sectionsData as any)?.results || sectionsData || [];
    const shopBySections = (shopByData as any)?.results || shopByData || [];

    const { data: filtersData = [] } = useFilters();
    const filterGroups = Array.isArray(filtersData) ? filtersData : (filtersData as any).results || [];
    // Flatten filter options for the selection list
    const allFilterOptions = filterGroups.flatMap((group: any) => 
        (group.options || []).map((opt: any) => ({ ...opt, groupName: group.name }))
    );

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editType, setEditType] = useState<string | null>(null); // 'hero', 'promo', 'content', 'shopByCatalog'
    const [editItem, setEditItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const openAddDialog = (type: string) => {
        setEditType(type);
        setEditItem(null);
        if (type === 'hero') {
            setFormData({ 
                title: '', 
                subtitle: '', 
                button_text: 'Shop Now', 
                button_link: '/shop', 
                button_text_2: '',
                button_link_2: '',
                content_alignment: 'center',
                order: 0, 
                is_active: true 
            });
        } else if (type === 'promo') {
            setFormData({ text: '', link: '', order: 0, is_active: true });
        } else if (type === 'content') {
            setFormData({ 
                title: '', 
                subtitle: '', 
                description: '', 
                section_type: 'banner', 
                button_text: '', 
                button_link: '', 
                badge_text: '', 
                featured_filter: '',
                order: 0, 
                is_active: true 
            });
        } else if (type === 'shopByCatalog') {
            setFormData({
                title: 'Shop by Collection',
                subtitle: '',
                description: '',
                order: 0,
                is_active: true,
                filter_ids: [],
            });
        }
        setDialogOpen(true);
    };

    const openEditDialog = (type: string, item: any) => {
        setEditType(type);
        setEditItem(item);

        if (type === 'shopByCatalog') {
            const filterIds = (item.filters || []).map((f: any) => f.id);
            setFormData({
                ...item,
                filter_ids: filterIds,
            });
        } else {
            setFormData({ ...item, image: null });
        }
        setDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formDataWithFiles = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    if (key === 'filter_ids' && Array.isArray(formData[key])) {
                        formData[key].forEach((id: number) => {
                            formDataWithFiles.append('filter_ids', id.toString());
                        });
                    } else {
                        formDataWithFiles.append(key, formData[key]);
                    }
                }
            });

            if (editItem) {
                if (editType === 'hero') {
                    await contentApi.updateHero(editItem.id, formDataWithFiles);
                } else if (editType === 'promo') {
                    await contentApi.updatePromo(editItem.id, formData);
                } else if (editType === 'content') {
                    await contentApi.updateContent(editItem.id, formDataWithFiles);
                } else if (editType === 'shopByCatalog') {
                    await contentApi.updateShopByCatalogSection(editItem.id, formData);
                }
                toast.success('Updated successfully');
            } else {
                if (editType === 'hero') {
                    await contentApi.createHero(formDataWithFiles);
                } else if (editType === 'promo') {
                    await contentApi.createPromo(formData);
                } else if (editType === 'content') {
                    await contentApi.createContent(formDataWithFiles);
                } else if (editType === 'shopByCatalog') {
                    await contentApi.createShopByCatalogSection(formData);
                }
                toast.success('Created successfully');
            }

            setDialogOpen(false);
            const queryKey =
                editType === 'hero'
                    ? 'hero-sections'
                    : editType === 'promo'
                        ? 'navbar-promos'
                        : editType === 'content'
                            ? 'content-sections'
                            : 'shop-by-catalog';

            queryClient.invalidateQueries({ queryKey: [queryKey] });
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type: string, id: number) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            if (type === 'hero') {
                await contentApi.deleteHero(id);
            } else if (type === 'promo') {
                await contentApi.deletePromo(id);
            } else if (type === 'content') {
                await contentApi.deleteContent(id);
            } else if (type === 'shopByCatalog') {
                await contentApi.deleteShopByCatalogSection(id);
            }

            toast.success('Item deleted successfully');

            const queryKey =
                type === 'hero'
                    ? 'hero-sections'
                    : type === 'promo'
                        ? 'navbar-promos'
                        : type === 'content'
                            ? 'content-sections'
                            : 'shop-by-catalog';

            queryClient.invalidateQueries({ queryKey: [queryKey] });
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    if (heroLoading || promosLoading || sectionsLoading || shopByLoading) {
        return (
            <div className="flex items-center justify-center py-20 italic text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading content...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-none border border-border/50">
                <h1 className="text-3xl font-bold tracking-tight font-serif italic text-primary">Content Management</h1>
                <p className="text-muted-foreground mt-1 italic">Manage your landing page hero, promos, and sections.</p>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none h-auto p-1 bg-muted/50 border">
                    <TabsTrigger value="hero" className="rounded-none text-[10px] uppercase tracking-widest font-bold py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Hero Sections</TabsTrigger>
                    <TabsTrigger value="promo" className="rounded-none text-[10px] uppercase tracking-widest font-bold py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Navbar Promos</TabsTrigger>
                    <TabsTrigger value="content" className="rounded-none text-[10px] uppercase tracking-widest font-bold py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Content Sections</TabsTrigger>
                    <TabsTrigger value="shopByCatalog" className="rounded-none text-[10px] uppercase tracking-widest font-bold py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Collections</TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="mt-6">
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                            <div>
                                <CardTitle className="font-serif">Hero Sections</CardTitle>
                                <CardDescription className="text-xs italic">The main banners at the top of your homepage.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog('hero')} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Add Hero
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Image</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Title</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                        <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {heroSections.map((hero: any) => (
                                        <TableRow key={hero.id}>
                                            <TableCell>
                                                <div className="h-10 w-16 bg-muted rounded-none overflow-hidden border">
                                                    {hero.image ? (
                                                        <img src={hero.image} alt={hero.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-full w-full p-2 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm font-serif">{hero.title}</TableCell>
                                            <TableCell className="text-xs">{hero.order}</TableCell>
                                            <TableCell>
                                                <Badge variant={hero.is_active ? 'default' : 'secondary'} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                    {hero.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog('hero', hero)} className="rounded-none h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive rounded-none h-8 w-8" onClick={() => handleDelete('hero', hero.id)}><Trash2 className="h-3 w-3" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="promo" className="mt-6">
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                            <div>
                                <CardTitle className="font-serif">Navbar Promos</CardTitle>
                                <CardDescription className="text-xs italic">Small promotional messages shown in the top navbar.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog('promo')} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Add Promo
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Text</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Link</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                        <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promos.map((promo: any) => (
                                        <TableRow key={promo.id}>
                                            <TableCell className="font-medium text-sm italic">{promo.text}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{promo.link || '-'}</TableCell>
                                            <TableCell className="text-xs">{promo.order}</TableCell>
                                            <TableCell>
                                                <Badge variant={promo.is_active ? 'default' : 'secondary'} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                    {promo.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog('promo', promo)} className="rounded-none h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive rounded-none h-8 w-8" onClick={() => handleDelete('promo', promo.id)}><Trash2 className="h-3 w-3" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                            <div>
                                <CardTitle className="font-serif">Content Sections</CardTitle>
                                <CardDescription className="text-xs italic">Additional sections like "The Winter Collection" with text and images.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog('content')} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Add Section
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Image</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Title</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Badge</TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order</TableHead>
                                        <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contentSections.map((section: any) => (
                                        <TableRow key={section.id}>
                                            <TableCell>
                                                <div className="h-10 w-16 bg-muted rounded-none overflow-hidden border">
                                                    {section.image ? (
                                                        <img src={section.image} alt={section.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-full w-full p-2 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm font-serif">{section.title}</TableCell>
                                            <TableCell className="text-xs">{section.badge_text || '-'}</TableCell>
                                            <TableCell className="text-xs">{section.order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog('content', section)} className="rounded-none h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive rounded-none h-8 w-8" onClick={() => handleDelete('content', section.id)}><Trash2 className="h-3 w-3" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shopByCatalog" className="mt-6">
                    <Card className="rounded-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                            <div>
                                <CardTitle className="font-serif">Shop by Collection</CardTitle>
                                <CardDescription className="text-xs italic">
                                    Configure the “Shop by Collection” section by choosing featured categories.
                                </CardDescription>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog('shopByCatalog')} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                <Plus className="h-4 w-4 mr-1" /> Add Section
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] uppercase tracking-widest font-bold">Title</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Featured Filters</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Order</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shopBySections.map((section: any) => (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium text-sm font-serif">{section.title}</TableCell>
                                                <TableCell className="max-w-xs text-xs text-muted-foreground italic">
                                                    {(section.filters || []).length > 0
                                                        ? section.filters.map((f: any) => f.name).join(', ')
                                                        : 'No filters selected'}
                                                </TableCell>
                                            <TableCell className="text-xs">{section.order}</TableCell>
                                            <TableCell>
                                                <Badge variant={section.is_active ? 'default' : 'secondary'} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                                    {section.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog('shopByCatalog', section)}
                                                        className="rounded-none h-8 w-8"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive rounded-none h-8 w-8"
                                                        onClick={() => handleDelete('shopByCatalog', section.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit/Add Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border-2">
                    <form onSubmit={handleSave}>
                        <DialogHeader className="border-b pb-4 mb-4">
                            <DialogTitle className="font-serif">
                                {editItem ? 'Edit' : 'Add'} {editType ? (editType.charAt(0).toUpperCase() + editType.slice(1)) : ''} Item
                            </DialogTitle>
                            <DialogDescription className="text-xs italic">
                                Make changes to your landing page content here.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Common Fields for Hero and Content (Image) */}
                            {(editType === 'hero' || editType === 'content') && (
                                <div className="grid gap-2">
                                    <Label htmlFor="image" className="text-[10px] uppercase tracking-widest font-bold">Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Input id="image" type="file" onChange={handleFileChange} className="rounded-none cursor-pointer" accept="image/*" />
                                        {editItem?.image && !formData.image && (
                                            <img src={editItem.image} alt="Current" className="h-10 w-14 object-cover rounded-none border shadow-sm" />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hero Specific Fields */}
                            {editType === 'hero' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-bold">Title</Label>
                                        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="rounded-none" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="subtitle" className="text-[10px] uppercase tracking-widest font-bold">Subtitle</Label>
                                        <Textarea id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} required className="rounded-none italic" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_text" className="text-[10px] uppercase tracking-widest font-bold">Button 1 Text</Label>
                                            <Input id="btn_text" value={formData.button_text} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} className="rounded-none" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_link" className="text-[10px] uppercase tracking-widest font-bold">Button 1 Link</Label>
                                            <Input id="btn_link" value={formData.button_link} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} className="rounded-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_text_2" className="text-[10px] uppercase tracking-widest font-bold">Button 2 Text (Optional)</Label>
                                            <Input id="btn_text_2" value={formData.button_text_2} onChange={(e) => setFormData({ ...formData, button_text_2: e.target.value })} className="rounded-none" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_link_2" className="text-[10px] uppercase tracking-widest font-bold">Button 2 Link (Optional)</Label>
                                            <Input id="btn_link_2" value={formData.button_link_2} onChange={(e) => setFormData({ ...formData, button_link_2: e.target.value })} className="rounded-none" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="alignment" className="text-[10px] uppercase tracking-widest font-bold">Content Alignment</Label>
                                        <Select value={formData.content_alignment} onValueChange={(val) => setFormData({ ...formData, content_alignment: val })}>
                                            <SelectTrigger className="rounded-none">
                                                <SelectValue placeholder="Select alignment" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                <SelectItem value="center">Center</SelectItem>
                                                <SelectItem value="left">Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Promo Specific Fields */}
                            {editType === 'promo' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="text" className="text-[10px] uppercase tracking-widest font-bold">Promo Text</Label>
                                        <Input id="text" value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} required className="rounded-none italic" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="link" className="text-[10px] uppercase tracking-widest font-bold">Link (Optional)</Label>
                                        <Input id="link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="rounded-none" />
                                    </div>
                                </>
                            )}

                            {/* Content Section Specific Fields */}
                            {editType === 'content' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-bold">Title</Label>
                                        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="rounded-none font-serif" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="subtitle" className="text-[10px] uppercase tracking-widest font-bold">Subtitle (Optional)</Label>
                                        <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="rounded-none italic" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold">Description</Label>
                                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-none text-xs h-24" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type" className="text-[10px] uppercase tracking-widest font-bold">Section Type</Label>
                                            <Select value={formData.section_type} onValueChange={(val) => setFormData({ ...formData, section_type: val })}>
                                                <SelectTrigger className="rounded-none">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="banner">Banner Section</SelectItem>
                                                    <SelectItem value="featured">Featured Collection (Dynamic)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="badge" className="text-[10px] uppercase tracking-widest font-bold">Badge Text (Optional)</Label>
                                            <Input id="badge" value={formData.badge_text} onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })} placeholder="e.g. Limited Edition" className="rounded-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_text" className="text-[10px] uppercase tracking-widest font-bold">Button Text (Optional)</Label>
                                            <Input id="btn_text" value={formData.button_text} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} className="rounded-none" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="btn_link" className="text-[10px] uppercase tracking-widest font-bold">Button Link (Optional)</Label>
                                            <Input id="btn_link" value={formData.button_link} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} className="rounded-none" />
                                        </div>
                                    </div>
                                    {formData.section_type === 'featured' && (
                                        <div className="grid gap-2 border-t pt-4 mt-2">
                                            <Label htmlFor="featured_filter" className="text-[10px] uppercase tracking-widest font-bold text-primary">Target Filter for Product Grid</Label>
                                            <Select 
                                                value={formData.featured_filter?.toString() || ""} 
                                                onValueChange={(val) => setFormData({ ...formData, featured_filter: val })}
                                            >
                                                <SelectTrigger className="rounded-none border-primary/20">
                                                    <SelectValue placeholder="Select filter to feature products from..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none max-h-60">
                                                    <SelectItem value="">No Filter (Editorial Only)</SelectItem>
                                                    {filterGroups.map((group: any) => (
                                                        <React.Fragment key={group.id}>
                                                            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30">{group.name}</div>
                                                            {(group.options || []).map((opt: any) => (
                                                                <SelectItem key={opt.id} value={opt.id.toString()} className="pl-6">
                                                                    {opt.name}
                                                                </SelectItem>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground italic">
                                                Choosing a filter will automatically display a grid of products matching that tag on the landing page.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Shop By Catalog Specific Fields */}
                            {editType === 'shopByCatalog' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-bold">Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="rounded-none font-serif"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Featured Filter Options</Label>
                                        <div className="border rounded-none p-3 space-y-2 max-h-64 overflow-y-auto bg-muted/20 text-xs">
                                            {filterGroups.length === 0 && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    No filters found. Create some filters first.
                                                </p>
                                            )}
                                            {filterGroups.map((group: any) => (
                                                <div key={group.id} className="space-y-1 mb-4">
                                                    <h4 className="text-[10px] uppercase tracking-widest font-bold bg-muted/50 px-2 py-1">{group.name}</h4>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 px-2">
                                                        {(group.options || []).map((opt: any) => {
                                                            const selectedIds = formData.filter_ids || [];
                                                            const isChecked = selectedIds.includes(opt.id);
                                                            return (
                                                                <div key={opt.id} className="flex items-center gap-2 py-1">
                                                                    <Checkbox
                                                                        id={`opt-${opt.id}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={() => {
                                                                            const current = formData.filter_ids || [];
                                                                            const next = isChecked
                                                                                ? current.filter((id: number) => id !== opt.id)
                                                                                : [...current, opt.id];
                                                                            setFormData({
                                                                                ...formData,
                                                                                filter_ids: next,
                                                                            });
                                                                        }}
                                                                        className="rounded-none"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`opt-${opt.id}`}
                                                                        className="text-[11px] cursor-pointer"
                                                                    >
                                                                        {opt.name}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Select specific filter options (e.g. Trout, Bass) to highlight on the homepage.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Common Fields for All */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="order" className="text-[10px] uppercase tracking-widest font-bold">Display Order</Label>
                                    <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="rounded-none" />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch id="active" checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} className="scale-75" />
                                    <Label htmlFor="active" className="text-[10px] uppercase tracking-widest font-bold pt-1">Active</Label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-6 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">Cancel</Button>
                            <Button type="submit" disabled={saving} className="rounded-none text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
