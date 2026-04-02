import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';

// ============================================================================
// API Functions
// ============================================================================

export const fetchFilterGroups = async () => {
    const response = await api.get('catalog/filter-groups/');
    return response.data;
};

export const createFilterGroup = async (groupData) => {
    const response = await api.post('catalog/filter-groups/', groupData);
    return response.data;
};

export const updateFilterGroup = async ({ slug, data }) => {
    const response = await api.patch(`catalog/filter-groups/${slug}/`, data);
    return response.data;
};

export const deleteFilterGroup = async (slug) => {
    const response = await api.delete(`catalog/filter-groups/${slug}/`);
    return response.data;
};

export const fetchFilterOptions = async (groupSlug = null) => {
    const url = groupSlug ? `catalog/filter-options/?group__slug=${groupSlug}` : 'catalog/filter-options/';
    const response = await api.get(url);
    return response.data;
};

export const createFilterOption = async (optionData) => {
    const response = await api.post('catalog/filter-options/', optionData);
    return response.data;
};

export const updateFilterOption = async ({ slug, data }) => {
    const response = await api.patch(`catalog/filter-options/${slug}/`, data);
    return response.data;
};

export const deleteFilterOption = async (slug) => {
    const response = await api.delete(`catalog/filter-options/${slug}/`);
    return response.data;
};

// ============================================================================
// React Query Hooks
// ============================================================================

export const useFilters = () => {
    return useQuery({
        queryKey: ['filter-groups'],
        queryFn: fetchFilterGroups,
        staleTime: 10 * 60 * 1000, 
    });
};

export const useCreateFilterGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFilterGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filter-groups'] });
        },
    });
};

export const useUpdateFilterGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateFilterGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filter-groups'] });
        },
    });
};

export const useDeleteFilterGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteFilterGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filter-groups'] });
            queryClient.invalidateQueries({ queryKey: ['filter-options'] });
        },
    });
};

// Options hooks
export const useFilterOptions = (groupSlug = null) => {
    return useQuery({
        queryKey: ['filter-options', groupSlug],
        queryFn: () => fetchFilterOptions(groupSlug),
        staleTime: 10 * 60 * 1000,
    });
};

export const useCreateFilterOption = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFilterOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filter-options'] });
            queryClient.invalidateQueries({ queryKey: ['filter-groups'] });
        },
    });
};

export const useDeleteFilterOption = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteFilterOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filter-options'] });
            queryClient.invalidateQueries({ queryKey: ['filter-groups'] });
        },
    });
};
