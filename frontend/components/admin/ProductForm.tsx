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
import { useCategories, useCreateCategory } from '@/api/categoryQueries';
import { toast } from 'sonner';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

export default function ProductForm() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const isEditMode = !!(slug && slug !== 'new');

    const router = useRouter();

    // Fetch data
    const { data: product, isLoading: isLoadingProduct } = useAdminProduct(isEditMode ? slug : null);

    // Using `any` casting since the React query might return list or direct array based on backend.
    const { data: categoriesDataResponse = [], isLoading: isLoadingCategories } = useCategories();
    const categoriesData: any[] = Array.isArray(categoriesDataResponse) ? categoriesDataResponse : (categoriesDataResponse as any).results || [];

    // Mutations
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const uploadImagesMutation = useUploadProductImages();
    const deleteImageMutation = useDeleteProductImage();
    const createCategoryMutation = useCreateCategory();

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

    // Categories
    const [selectedCategory, setSelectedCategory] = useState('');

    // Category dialog
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryParent, setNewCategoryParent] = useState('');

    // Media
    const [images, setImages] = useState<any[]>([]);
    const [imageFiles, setImageFiles] = useState<any[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

    // Variants
    const [options, setOptions] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [showOptionDialog, setShowOptionDialog] = useState(false);
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionValues, setNewOptionValues] = useState('');

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
            setSelectedCategory(product.category?.id?.toString() || '');
            setIsSet(product.is_set || false);

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
                    name: v.name,
                    sku: v.sku || '',
                    price: v.price_override !== null && v.price_override !== undefined ? v.price_override : product.base_price,
                    quantity: v.stock_quantity || 0,
                }));
                setVariants(loadedVariants);
            }

            // Load options from metadata if present
            if (product.metadata?.options) {
                setOptions(product.metadata.options);
            }
        }
    }, [product, isEditMode]);

    // Handle base price propagation to variants
    useEffect(() => {
        if (variants.length > 0 && price) {
            setVariants(prev => prev.map(v => {
                // Only propagate if the variant price is empty or was previously synced with base price
                // This is a simplified check - in a real app we might track 'isManualOverride'
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
                // If the SKU is empty or seems to be auto-generated from previous base SKU
                const variantSlug = slugify(v.name).toUpperCase();
                const expectedAutoSku = sku ? `${sku}-${variantSlug}` : '';

                if (!v.sku || v.isSkuAutoSynced) {
                    return { ...v, sku: expectedAutoSku, isSkuAutoSynced: true };
                }
                return v;
            }));
        }
    }, [sku]);

    const getFlatCategories = () => {
        let result: any[] = [];
        const flatten = (items: any[], level = 0) => {
            items.forEach((cat) => {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children, level + 1);
                }
            });
        };
        flatten(categoriesData || []);
        return result;
    };

    const generateVariants = (opts: any[]) => {
        if (opts.length === 0) {
            setVariants([]);
            return;
        }

        const combinations = opts.reduce((acc, option) => {
            if (acc.length === 0) {
                return option.values.map((value: string) => [{ option: option.name, value }]);
            }

            const newCombinations: any[] = [];
            acc.forEach((combination: any) => {
                option.values.forEach((value: string) => {
                    newCombinations.push([...combination, { option: option.name, value }]);
                });
            });
            return newCombinations;
        }, []);

        const newVariants = combinations.map((combination: any, index: number) => {
            const variantName = combination.map((c: any) => c.value).join(' / ');
            const existingVariant = variants.find(v => v.name === variantName);

            const variantSlug = slugify(variantName).toUpperCase();
            const generatedSku = sku ? `${sku}-${variantSlug}` : '';

            return {
                id: existingVariant?.id || Date.now() + index,
                name: variantName,
                options: combination,
                sku: existingVariant?.sku || generatedSku,
                price: existingVariant?.price || price,
                quantity: existingVariant?.quantity || '',
                isAutoSynced: existingVariant ? existingVariant.isAutoSynced : true,
                isSkuAutoSynced: existingVariant ? existingVariant.isSkuAutoSynced : true,
            };
        });

        setVariants(newVariants);
    };

    const handleAddOption = () => {
        if (!newOptionName || !newOptionValues) return;

        const values = newOptionValues.split(',').map(v => v.trim()).filter(v => v);
        const newOption = {
            id: Date.now(),
            name: newOptionName,
            values,
        };

        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);
        generateVariants(updatedOptions);

        setNewOptionName('');
        setNewOptionValues('');
        setShowOptionDialog(false);
    };

    const handleRemoveOption = (optionId: number) => {
        const updatedOptions = options.filter(opt => opt.id !== optionId);
        setOptions(updatedOptions);
        generateVariants(updatedOptions);
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

    const handleAddCategory = () => {
        if (!newCategoryName) return;

        const categoryData = {
            name: newCategoryName,
            parent: newCategoryParent || null,
        };

        createCategoryMutation.mutate(categoryData, {
            onSuccess: (data: any) => {
                toast.success(`Category ${data.name} has been created successfully.`);
                setNewCategoryName('');
                setNewCategoryParent('');
                setShowCategoryDialog(false);
                setSelectedCategory(data.id.toString());
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to create category");
            },
        });
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
                // Find all previous non-existing images to get the correct file index
                const nonExistingBefore = images.slice(0, imageIndex).filter(img => !img.isExisting).length;
                setImageFiles(prev => prev.filter((_, idx) => idx !== nonExistingBefore));
            }
        }
        setImages(images.filter(img => img.id !== imageId));
    };

    const handleSave = async () => {
        if (!name || !price || !sku || !selectedCategory) {
            toast.error("Please fill in all required fields (Name, Price, SKU, Category).");
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
            category_id: parseInt(selectedCategory),
            metadata: {
                options: options.map(opt => ({ name: opt.name, values: opt.values })),
            },
        };

        if (variants.length > 0) {
            productData.variants_data = variants.map(v => {
                const variantData: any = {
                    name: v.name,
                    sku: v.sku,
                    price_override: parseFloat(v.price) !== parseFloat(price) ? parseFloat(v.price) : null,
                    stock_quantity: parseInt(v.quantity) || 0,
                };

                // If the ID is a real database ID (smaller integer usually, or at least we know it's not a timestamp-based temp ID)
                // In our case, loaded variants have their real IDs.
                // However, our backend matches by SKU/Name, so this is mostly for completeness.
                return variantData;
            });
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
                                    placeholder="e.g., Silk Maxi Dress"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the product..."
                                    className="min-h-[120px] rounded-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold">Extended Details</Label>
                                <RichTextEditor value={details} onChange={setDetails} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Media</CardTitle>
                            <CardDescription>Product images.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input
                                type="file"
                                id="imageUpload"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor="imageUpload"
                                className="border-2 border-dashed border-border rounded-none p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer block"
                            >
                                <div className="h-10 w-10 bg-muted flex items-center justify-center mb-3">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-[10px] uppercase tracking-widest font-bold">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1 italic">PNG, JPG or GIF (max. 800x400px)</p>
                            </label>

                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {images.map((image, index) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-24 object-cover rounded-none border"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                                                onClick={() => handleRemoveImage(image.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                            {index === 0 && (
                                                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2 py-0.5">
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Pricing</CardTitle>
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
                                            className="pl-7 rounded-none"
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
                            <CardTitle className="font-serif italic">Variants</CardTitle>
                            <CardDescription>Add options like size or color to create product variants.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {options.length > 0 && (
                                <div className="space-y-2">
                                    {options.map((option, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-none bg-muted/20">
                                            <div>
                                                <p className="font-medium text-sm">{option.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{option.values.join(', ')}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveOption(option.id)}
                                                className="rounded-none"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
                                <DialogTrigger render={<Button variant="outline" className="w-full rounded-none border-dashed border-2 py-6" />}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Add Option</span>
                                </DialogTrigger>
                                <DialogContent className="rounded-none">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif italic">Add Option</DialogTitle>
                                        <DialogDescription>
                                            Create a new option like Size or Color.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="optionName" className="text-[10px] uppercase tracking-widest font-bold">Option Name</Label>
                                            <Input
                                                id="optionName"
                                                placeholder="e.g., Size, Color"
                                                value={newOptionName}
                                                onChange={(e) => setNewOptionName(e.target.value)}
                                                className="rounded-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="optionValues" className="text-[10px] uppercase tracking-widest font-bold">Values (comma-separated)</Label>
                                            <Input
                                                id="optionValues"
                                                placeholder="e.g., S, M, L, XL"
                                                value={newOptionValues}
                                                onChange={(e) => setNewOptionValues(e.target.value)}
                                                className="rounded-none"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowOptionDialog(false)} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddOption} className="rounded-none text-[10px] uppercase tracking-widest font-bold">Add Option</Button>
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
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Variant</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Price</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Qty</TableHead>
                                                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">SKU</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {variants.map(variant => {
                                                    const isOverridden = parseFloat(variant.price) !== parseFloat(price);
                                                    return (
                                                        <TableRow key={variant.id}>
                                                            <TableCell className="font-medium text-sm whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    {variant.name}
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

                    {/* Organization */}
                    <Card className="rounded-none border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif italic">Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold">Category *</Label>
                                {isLoadingCategories ? (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading categories...
                                    </div>
                                ) : (
                                    <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || '')}>
                                        <SelectTrigger className="rounded-none">
                                            <SelectValue>
                                                {selectedCategory
                                                    ? (getFlatCategories().find(
                                                        (cat) => cat.id.toString() === selectedCategory
                                                    )?.name ?? "Selected Category")
                                                    : "Select category"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            {getFlatCategories().map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {'\u00A0\u00A0'.repeat(cat.level)}
                                                    {cat.level > 0 ? `↳ ${cat.name}` : cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                                <DialogTrigger render={<Button variant="outline" className="w-full rounded-none text-[10px] uppercase tracking-widest font-bold" />}>
                                    <div className="flex items-center justify-center">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Category
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="rounded-none">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif italic">Add Category</DialogTitle>
                                        <DialogDescription>
                                            Create a new category or subcategory.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newCategory" className="text-[10px] uppercase tracking-widest font-bold">Category Name</Label>
                                            <Input
                                                id="newCategory"
                                                placeholder="e.g., Jewelry"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="rounded-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold">Parent Category (Optional)</Label>
                                            <Select value={newCategoryParent} onValueChange={(val) => setNewCategoryParent(val || '')}>
                                                <SelectTrigger className="rounded-none">
                                                    <SelectValue placeholder="None (root category)" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="none">None (root category)</SelectItem>
                                                    {getFlatCategories()
                                                        .filter(cat => cat.level < 2)
                                                        .map(cat => (
                                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                {'\u00A0\u00A0'.repeat(cat.level)}
                                                                {cat.level > 0 ? `↳ ${cat.name}` : cat.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="rounded-none text-[10px] uppercase tracking-widest font-bold">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddCategory}
                                            disabled={createCategoryMutation.isPending}
                                            className="rounded-none text-[10px] uppercase tracking-widest font-bold"
                                        >
                                            {createCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
