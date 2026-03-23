import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all products for admin (includes inactive products)
 */
export const fetchAllProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append('search', filters.search);
    }
    if (filters.page) {
        params.append('page', filters.page);
    }
    if (filters.category_root) {
        const val = Array.isArray(filters.category_root)
            ? filters.category_root.join(',')
            : filters.category_root;
        params.append('category_root', val);
    }
    if (filters.category_id) {
        const val = Array.isArray(filters.category_id)
            ? filters.category_id.join(',')
            : filters.category_id;
        params.append('category_id', val);
    }
    if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active);
    }
    if (filters.ordering) {
        params.append('ordering', filters.ordering);
    }

    const response = await api.get(`catalog/products/?${params.toString()}`);
    return response.data;
};

/**
 * Fetch a single product by slug
 */
export const fetchProductBySlug = async (slug) => {
    const response = await api.get(`catalog/products/${slug}/`);
    return response.data;
};

/**
 * Create a new product
 * Note: Image upload via file is not yet implemented. 
 * For now, images must be uploaded separately or via direct URLs.
 */
export const createProduct = async (productData) => {
    const response = await api.post('catalog/products/', productData);
    return response.data;
};

/**
 * Update an existing product
 * Note: Image upload via file is not yet implemented.
 */
export const updateProduct = async ({ slug, data }) => {
    const response = await api.patch(`catalog/products/${slug}/`, data);
    return response.data;
};

/**
 * Delete a product (soft delete by default)
 */
export const deleteProduct = async ({ slug, hard = false }) => {
    const params = hard ? '?hard=true' : '';
    const response = await api.delete(`catalog/products/${slug}/${params}`);
    return response.data;
};

/**
 * Restore a soft-deleted product
 */
export const restoreProduct = async (slug) => {
    const response = await api.post(`catalog/products/${slug}/restore/`);
    return response.data;
};

/**
 * Upload images for a product
 */
export const uploadProductImages = async ({ productSlug, images, replace = false }) => {
    const formData = new FormData();

    // Add each image file
    images.forEach((imageData) => {
        if (imageData.file) {
            formData.append('images', imageData.file);
        }
    });

    // Add metadata for each image
    images.forEach((imageData, index) => {
        if (imageData.alt_text) {
            formData.append(`alt_text_${index}`, imageData.alt_text);
        }
        if (imageData.is_feature) {
            formData.append(`is_feature_${index}`, 'true');
        }
    });

    // Add replace flag
    if (replace) {
        formData.append('replace', 'true');
    }

    const response = await api.post(`catalog/products/${productSlug}/upload_images/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Delete a product image
 */
export const deleteProductImage = async (imageId) => {
    const response = await api.delete(`catalog/product-images/${imageId}/`);
    return response.data;
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all products for admin
 */
export const useAdminProducts = (filters = {}) => {
    return useQuery({
        queryKey: ['admin-products', filters],
        queryFn: () => fetchAllProducts(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

/**
 * Hook to fetch a single product by slug
 */
export const useAdminProduct = (slug) => {
    return useQuery({
        queryKey: ['admin-product', slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to create a product
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
};

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProduct,
        onSuccess: (data, variables) => {
            // Invalidate both the list and the specific product
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-product', variables.slug] });
        },
    });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
};

/**
 * Hook to restore a product
 */
export const useRestoreProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreProduct,
        onSuccess: (data, slug) => {
            // Invalidate products list and the specific product
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-product', slug] });
        },
    });
};

/**
 * Hook to upload product images
 */
export const useUploadProductImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadProductImages,
        onSuccess: (data, variables) => {
            // Invalidate the specific product to refresh with new images
            queryClient.invalidateQueries({ queryKey: ['admin-product', variables.productSlug] });
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
};

/**
 * Hook to delete product image
 */
export const useDeleteProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProductImage,
        onSuccess: () => {
            // Success handler can be specific to component
        },
    });
};
