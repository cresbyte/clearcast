"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAdminProduct, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadProductImages, useDeleteProductImage } from '@/api/adminProductApi';
import { useFilters } from '@/api/filterQueries';
import { toast } from 'sonner';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

export default function ProductForm() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const isEditMode = !!(slug && slug !== 'new');

    const router = useRouter();

    // Fetch data
    const { data: product, isLoading: isLoadingProduct } = useAdminProduct(isEditMode ? slug : null);

    const { data: filtersDataResponse = [], isLoading: isLoadingFilters } = useFilters();
    const filterGroups: any[] = Array.isArray(filtersDataResponse) ? filtersDataResponse : (filtersDataResponse as any).results || [];

    // Mutations
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const uploadImagesMutation = useUploadProductImages();
    const deleteImageMutation = useDeleteProductImage();

    // Basic product info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [price, setPrice] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [status, setStatus] = useState('active');
    const [isSet, setIsSet] = useState(false);

    // Inventory
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');

    // Filters
    const [selectedFilters, setSelectedFilters] = useState<number[]>([]);

    // Media
    const [images, setImages] = useState<any[]>([]);
    const [imageFiles, setImageFiles] = useState<any[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

    // Variants (Sizes only)
    const [variants, setVariants] = useState<any[]>([]);
    const [showOptionDialog, setShowOptionDialog] = useState(false);
    const [newVariantSize, setNewVariantSize] = useState('');

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load product data when editing
    useEffect(() => {
        if (product && isEditMode) {
            setName(product.name || '');
            setDescription(product.description || '');
            setDetails(product.details || '');
            setPrice(product.base_price || '');
            setDiscountPercentage(product.discount_percentage || '');
            setStatus(product.is_active ? 'active' : 'draft');
            setSku(product.sku || '');
            setQuantity(product.stock_quantity || '');
            setIsSet(product.is_set || false);

            if (product.filters && product.filters.length > 0) {
                setSelectedFilters(product.filters.map((f: any) => f.id));
            }

            // Load images
            if (product.images && product.images.length > 0) {
                const loadedImages = product.images.map((img: any) => ({
                    id: img.id,
                    url: img.image_url || img.image,
                    name: img.alt_text || 'Product image',
                    isExisting: true,
                    is_feature: img.is_feature,
                }));
                setImages(loadedImages);
            }

            // Load variants
            if (product.variants && product.variants.length > 0) {
                const loadedVariants = product.variants.map((v: any) => ({
                    id: v.id,
                    size: v.size || v.name || '',
                    sku: v.sku || '',
                    price: v.price_override !== null && v.price_override !== undefined ? v.price_override : product.base_price,
                    quantity: v.stock_quantity || 0,
                    isAutoSynced: false,
                    isSkuAutoSynced: false
                }));
                setVariants(loadedVariants);
            }
        }
    }, [product, isEditMode]);

    // Handle base price propagation to variants
    useEffect(() => {
        if (variants.length > 0 && price) {
            setVariants(prev => prev.map(v => {
                if (!v.price || v.isAutoSynced) {
                    return { ...v, price: price, isAutoSynced: true };
                }
                return v;
            }));
        }
    }, [price]);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    // Handle base SKU propagation to variants
    useEffect(() => {
        if (variants.length > 0 && sku) {
            setVariants(prev => prev.map(v => {
                const variantSlug = slugify(v.size || '').toUpperCase();
                const expectedAutoSku = sku ? `${sku}-${variantSlug}` : '';

                if (!v.sku || v.isSkuAutoSynced) {
                    return { ...v, sku: expectedAutoSku, isSkuAutoSynced: true };
                }
                return v;
            }));
        }
    }, [sku]);

    const handleAddVariant = () => {
        if (!newVariantSize) return;

        const newVariant = {
            id: Date.now(),
            size: newVariantSize,
            sku: sku ? `${sku}-${slugify(newVariantSize).toUpperCase()}` : '',
            price: price || '0',
            quantity: '0',
            isAutoSynced: true,
            isSkuAutoSynced: true
        };

        setVariants([...variants, newVariant]);
        setNewVariantSize('');
        setShowOptionDialog(false);
    };

    const handleRemoveVariant = (variantId: number) => {
        setVariants(variants.filter(v => v.id !== variantId));
    };

    const handleVariantChange = (variantId: number, field: string, value: string) => {
        setVariants(variants.map(variant =>
            variant.id === variantId
                ? {
                    ...variant,
                    [field]: value,
                    isAutoSynced: field === 'price' ? false : variant.isAutoSynced,
                    isSkuAutoSynced: field === 'sku' ? false : variant.isSkuAutoSynced
                }
                : variant
        ));
    };

    const handleToggleFilter = (filterId: number) => {
        setSelectedFilters(prev => 
            prev.includes(filterId)
                ? prev.filter(id => id !== filterId)
                : [...prev, filterId]
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages: any[] = [];
        const newFiles: any[] = [];

        files.forEach((file: any) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    newImages.push({
                        id: Date.now() + Math.random(),
                        url: event.target?.result,
                        name: file.name,
                        file: file,
                    });
                    newFiles.push(file);

                    if (newImages.length === files.length) {
                        setImages(prev => [...prev, ...newImages]);
                        setImageFiles(prev => [...prev, ...newFiles]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleRemoveImage = (imageId: number) => {
        const imageToRemove = images.find(img => img.id === imageId);
        if (imageToRemove?.isExisting) {
            setDeletedImageIds(prev => [...prev, imageId]);
        } else {
            const imageIndex = images.findIndex(img => img.id === imageId);
            if (imageIndex !== -1) {
                const nonExistingBefore = images.slice(0, imageIndex).filter(img => !img.isExisting).length;
                setImageFiles(prev => prev.filter((_, idx) => idx !== nonExistingBefore));
            }
        }
        setImages(images.filter(img => img.id !== imageId));
    };

    const handleSave = async () => {
        if (!name || !price || !sku) {
            toast.error("Please fill in all required fields (Name, Price, SKU).");
            return;
        }

        setIsSubmitting(true);

        const productData: any = {
            name: name,
            description: description,
            details: details,
            base_price: parseFloat(price),
            discount_percentage: parseFloat(discountPercentage) || 0,
            sku: sku,
            stock_quantity: parseInt(quantity) || 0,
            is_active: status === 'active',
            is_set: isSet,
            filter_ids: selectedFilters,
        };

        if (variants.length > 0) {
            productData.variants_data = variants.map(v => ({
                size: v.size,
                sku: v.sku,
                price_override: parseFloat(v.price) !== parseFloat(price) ? parseFloat(v.price) : null,
                stock_quantity: parseInt(v.quantity) || 0,
            }));
        }

        const mutation = isEditMode ? updateProductMutation : createProductMutation;
        const mutationData = isEditMode ? { slug: slug as string, data: productData } : productData;

        mutation.mutate(mutationData, {
            onSuccess: async (data: any) => {
                // 1. Handle deleted images
                if (deletedImageIds.length > 0) {
                    try {
                        await Promise.all(deletedImageIds.map(id => deleteImageMutation.mutateAsync(id)));
                    } catch (error) {
                        console.error('Some images failed to delete:', error);
                    }
                }

                // 2. Handle new images
                const newImages = images.filter(img => img.file && !img.isExisting);
                if (newImages.length > 0) {
                    try {
                        await uploadImagesMutation.mutateAsync({
                            productSlug: data.slug,
                            images: newImages.map((img, index) => ({
                                file: img.file,
                                alt_text: data.name,
                                is_feature: index === 0 && images.filter(i => i.isExisting).length === 0
                            })),
                            replace: false
                        });
                    } catch (imageError) {
                        console.error('Image upload failed:', imageError);
                        toast.warning("Product saved but some images failed to upload.");
                    }
                }

                toast.success(`${data.name} has been ${isEditMode ? 'updated' : 'created'} successfully.`);
                setIsSubmitting(false);
                router.push('/admin/products');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteProductMutation.mutate(
                { slug: slug as string, hard: false },
                {
                    onSuccess: () => {
                        toast.success(`${name} has been deleted successfully.`);
                        router.push('/admin/products');
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to delete product");
                    },
                }
            );
        }
    };

    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard all changes?')) {
            router.push('/admin/products');
        }
    };

    if (isLoadingProduct && isEditMode) {
        return (
            <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-6 rounded-none border border-border/50">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="ghost" size="icon" className="rounded-none">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-serif italic">
                            {isEditMode ? 'Edit Product' : 'Add Product'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEditMode ? 'Update product information' : 'Create a new product for your store'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Update Product' : 'Save Product'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Product Details</CardTitle>
                            <CardDescription>Basic information about your product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold">Product Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Adams Parachute"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-none text-lg py-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold">Short Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="A brief description for the listing."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-none resize-none min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold">Detailed Description</Label>
                                <RichTextEditor
                                    value={details}
                                    onChange={setDetails}
                                    placeholder="Full details about the fly..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Media</CardTitle>
                            <CardDescription>Add images representing the product.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {images.map((img, idx) => (
                                    <div key={img.id} className="relative group aspect-square border border-border/50 rounded-none overflow-hidden bg-muted/20">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemoveImage(img.id)}
                                                className="rounded-none h-8 w-8"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {idx === 0 && (
                                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2 py-1">
                                                Main
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div>
                                    <Label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border/50 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center">Add<br />Images</span>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Pricing</CardTitle>
                            <CardDescription>Set base price and optional discount.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-[10px] uppercase tracking-widest font-bold">Base Price *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            id="price"
                                            placeholder="0.00"
                                            className="pl-8 rounded-none"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            type="number"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount" className="text-[10px] uppercase tracking-widest font-bold">Discount Percentage</Label>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            placeholder="0"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(e.target.value)}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="pr-8 rounded-none"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Enter a percentage between 0-100
                                    </p>
                                </div>
                            </div>
                            {discountPercentage && parseFloat(discountPercentage) > 0 && price && (
                                <div className="p-4 bg-muted/50 rounded-none border border-border/50">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sale Price</p>
                                    <p className="text-2xl font-bold font-serif mt-1">
                                        ${(parseFloat(price) - (parseFloat(price) * parseFloat(discountPercentage) / 100)).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                        {discountPercentage}% off ${parseFloat(price).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inventory */}
                    {variants.length === 0 && (
                        <Card className="rounded-none border-border/50">
                            <CardHeader>
                                <CardTitle className="font-serif italic">Inventory</CardTitle>
                                <CardDescription>Track quantity and SKU.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku" className="text-[10px] uppercase tracking-widest font-bold">SKU *</Label>
                                        <Input
                                            id="sku"
                                            placeholder="SKU-001"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            className="rounded-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity" className="text-[10px] uppercase tracking-widest font-bold">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            placeholder="0"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            type="number"
                                            className="rounded-none"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Variants */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Variants (Sizes)</CardTitle>
                            <CardDescription>Add specific sizes for this fishing fly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
                                <DialogTrigger render={<Button variant="outline" className="w-full rounded-none border-dashed border-2 py-6" />}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Add Size</span>
                                </DialogTrigger>
                                <DialogContent className="rounded-none">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif italic">Add Size</DialogTitle>
                                        <DialogDescription>
                                            Enter the hook size or dimension for this variant.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newVariantSize" className="text-[10px] uppercase tracking-widest font-bold">Size Label</Label>
                                            <Input
                                                id="newVariantSize"
                                                placeholder="e.g., Size 12, Medium"
                                                value={newVariantSize}
                                                onChange={(e) => setNewVariantSize(e.target.value)}
                                                className="rounded-none"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowOptionDialog(false)} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddVariant} className="rounded-none text-[10px] uppercase tracking-widest font-bold">Add Size</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {variants.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3 text-muted-foreground">Variant Details</h4>
                                    <div className="border border-border/50 rounded-none overflow-x-auto bg-card shadow-sm">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Size</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Price</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Qty</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">SKU</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {variants.map(variant => {
                                                    const isOverridden = parseFloat(variant.price) !== parseFloat(price);
                                                    return (
                                                        <TableRow key={variant.id}>
                                                            <TableCell className="font-medium text-sm whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    {variant.size}
                                                                    {isOverridden && (
                                                                        <div className="h-2 w-2 rounded-full bg-amber-500" title="Custom Price" />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="relative">
                                                                    <span className="absolute left-2 top-1.5 text-muted-foreground text-[10px]">$</span>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={variant.price}
                                                                        onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                                                                        className={`w-28 rounded-none h-8 pl-5 text-xs ${isOverridden ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={variant.quantity}
                                                                    onChange={(e) => handleVariantChange(variant.id, 'quantity', e.target.value)}
                                                                    className="w-16 rounded-none h-8 text-xs font-mono"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    placeholder="SKU"
                                                                    value={variant.sku}
                                                                    onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                                                    className="w-32 rounded-none h-8 text-xs font-mono"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => handleRemoveVariant(variant.id)}
                                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-none"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Status */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={status} onValueChange={(val) => setStatus(val || '')}>
                                <SelectTrigger className="rounded-none">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Organization / Filters */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-2 border border-border/50 bg-muted/20 p-4">
                                <Label htmlFor="is-set-toggle" className="flex-1 text-[10px] uppercase tracking-widest font-bold cursor-pointer">
                                    Is Fly Set
                                </Label>
                                <Checkbox 
                                    id="is-set-toggle" 
                                    checked={isSet} 
                                    onCheckedChange={(checked) => setIsSet(!!checked)}
                                    className="h-5 w-5"
                                    style={{ borderRadius: 0 }}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest font-bold">Filters</Label>
                                
                                {isLoadingFilters ? (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading filters...
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {filterGroups.map((group) => (
                                            <div key={group.id} className="space-y-2">
                                                <h4 className="font-medium text-sm border-b pb-1">{group.name}</h4>
                                                <div className="flex flex-wrap gap-3 mt-2">
                                                    {group.options.map((option: any) => (
                                                        <div key={option.id} className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`filter-${option.id}`} 
                                                                checked={selectedFilters.includes(option.id)}
                                                                onCheckedChange={() => handleToggleFilter(option.id)}
                                                                className="rounded-none"
                                                            />
                                                            <label 
                                                                htmlFor={`filter-${option.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                            >
                                                                {option.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="rounded-none border-destructive/30 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive font-serif italic">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start rounded-none text-[10px] uppercase tracking-widest font-bold"
                                onClick={handleDiscard}
                            >
                                Discard Changes
                            </Button>
                            {isEditMode && (
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start rounded-none text-[10px] uppercase tracking-widest font-bold"
                                    onClick={handleDelete}
                                    disabled={deleteProductMutation.isPending}
                                >
                                    {deleteProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete Product
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
