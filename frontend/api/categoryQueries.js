import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all categories
 */
export const fetchCategories = async () => {
    const response = await api.get('catalog/categories/');
    return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
    const response = await api.post('catalog/categories/', categoryData);
    return response.data;
};

/**
 * Update a category
 */
export const updateCategory = async ({ slug, data }) => {
    const response = await api.patch(`catalog/categories/${slug}/`, data);
    return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (slug) => {
    const response = await api.delete(`catalog/categories/${slug}/`);
    return response.data;
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all categories
 */
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

/**
 * Hook to create a category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            // Invalidate and refetch categories
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
