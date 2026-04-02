import api from './axios';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all products with optional filters
 */
export const fetchProducts = async ({
    searchQuery = '',
    filters = [],
    priceRange = [0, 1000],
    sortBy = 'featured',
    page = 1,
    isSet = null
}) => {
    const params = new URLSearchParams();

    if (searchQuery) params.append('search', searchQuery);
    if (page) params.append('page', page);
    if (isSet !== null && isSet !== undefined) params.append('is_set', isSet.toString());

    // Filters are an array of option slugs
    filters.forEach((slug) => params.append('filters__slug', slug));

    // Price range
    if (priceRange && priceRange.length === 2) {
        params.append('min_price', priceRange[0]);
        params.append('max_price', priceRange[1]);
    }

    // Sort mapping
    const sortMap = {
        'price-asc': 'base_price',
        'price-desc': '-base_price',
        'name': 'name',
        'newest': '-created_at',
        'featured': '' // Default ordering
    };

    if (sortBy && sortMap[sortBy]) {
        params.append('ordering', sortMap[sortBy]);
    }

    const response = await api.get(`catalog/products/?${params.toString()}`);

    const data = response.data;
    const results = data.results || data || [];

    const products = results.map(p => {
        const filterNames = p.filters?.map(f => f.name).join(', ') || 'Uncategorized';
        return {
            ...p,
            title: p.name,
            price: parseFloat(p.base_price),
            sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
            primary_image: p.primary_image,
            images: p.images?.map(img => img.image_url || img.image) || [],
            categoryName: filterNames,
        };
    });

    return {
        results: products,
        count: data.count || products.length,
        next: data.next,
        previous: data.previous
    };
};



/**
 * Fetch a single product by Slug
 */
export const fetchProduct = async (productSlug) => {
    const response = await api.get(`catalog/products/${productSlug}/`);
    const product = response.data;

    if (!product) {
        throw new Error('Product not found');
    }

    // Normalize data structure for frontend components
    return {
        ...product,
        id: product.id,
        title: product.name || product.title,
        price: parseFloat(product.base_price || 0),
        current_price: parseFloat(product.current_price || product.sale_price || product.base_price || 0),
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        primary_image: product.primary_image,
        images: Array.isArray(product.images)
            ? product.images.map(img => img.image_url || img.image || img)
            : (product.primary_image ? [product.primary_image] : []),
        variants: Array.isArray(product.variants) ? product.variants.map(v => ({
            ...v,
            price: parseFloat(v.price || product.base_price || 0),
            current_price: parseFloat(v.current_price || v.price_override || product.sale_price || product.base_price || 0)
        })) : []
    };
};

/**
 * Search products
 */
export const searchProducts = async (query) => {
    if (!query || query.length < 2) return [];

    const response = await api.get(`catalog/products/?search=${query}`);
    const results = response.data.results || response.data;

    return results.slice(0, 5).map(p => ({
        id: p.id,
        title: p.name,
        image: p.images?.[0]?.image_url || '',
        price: parseFloat(p.base_price)
    }));
};

/**
 * Fetch products by filter
 */
export const fetchProductsByFilter = async (filterSlug) => {
    const response = await api.get(`catalog/products/?filters__slug=${filterSlug}`);
    // Transform
    const results = response.data.results || response.data;
    return results.map(p => ({
        ...p,
        title: p.name,
        price: parseFloat(p.base_price),
        primary_image: p.primary_image,
        images: p.images.map(img => img.image_url || img.image)
    }));
};

/**
 * Fetch products for infinite scroll
 */
export const fetchInfiniteProducts = async ({ pageParam = 1, filters = {} }) => {
    const params = new URLSearchParams();
    params.append('page', pageParam);

    if (filters.searchQuery) params.append('search', filters.searchQuery);

    // Filters
    if (filters.filters && filters.filters.length > 0) {
        filters.filters.forEach((slug) => params.append('filters__slug', slug));
    }

    // Sort
    const sortMap = {
        'price-asc': 'base_price',
        'price-desc': '-base_price',
        'name': 'name',
        'newest': '-created_at',
        'featured': ''
    };
    if (filters.sortBy && sortMap[filters.sortBy]) {
        params.append('ordering', sortMap[filters.sortBy]);
    }

    const response = await api.get(`catalog/products/?${params.toString()}`);

    const data = response.data;

    // Map results
    const products = (data.results || []).map(p => ({
        ...p,
        title: p.name,
        price: parseFloat(p.base_price),
        primary_image: p.primary_image,
        images: p.images.map(img => img.image_url || img.image)
    }));

    return {
        products,
        nextPage: data.next ? pageParam + 1 : undefined,
        hasMore: !!data.next,
    };
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all products with filters
 */
export const useProducts = (filters = {}) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to fetch a single product by Slug
 */
export const useProduct = (productSlug) => {
    return useQuery({
        queryKey: ['product', productSlug],
        queryFn: () => fetchProduct(productSlug),
        enabled: !!productSlug,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

/**
 * Hook for product search with autocomplete
 */
export const useProductSearch = (query) => {
    return useQuery({
        queryKey: ['product-search', query],
        queryFn: () => searchProducts(query),
        enabled: query.length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

/**
 * Hook to fetch products by filter
 */
export const useProductsByFilter = (filterSlug) => {
    return useQuery({
        queryKey: ['products', 'filter', filterSlug],
        queryFn: () => fetchProductsByFilter(filterSlug),
        enabled: !!filterSlug,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook for infinite scroll products
 */
export const useInfiniteProducts = (filters = {}) => {
    return useInfiniteQuery({
        queryKey: ['products', 'infinite', filters],
        queryFn: ({ pageParam }) => fetchInfiniteProducts({ pageParam, filters }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to prefetch a product (useful for hover effects)
 */
export const usePrefetchProduct = () => {
    const queryClient = useQueryClient();

    return (productSlug) => {
        queryClient.prefetchQuery({
            queryKey: ['product', productSlug],
            queryFn: () => fetchProduct(productSlug),
            staleTime: 10 * 60 * 1000,
        });
    };
};

/**
 * Hook to prefetch products with filters
 */
export const usePrefetchProducts = () => {
    const queryClient = useQueryClient();

    return (filters) => {
        queryClient.prefetchQuery({
            queryKey: ['products', filters],
            queryFn: () => fetchProducts(filters),
            staleTime: 5 * 60 * 1000,
        });
    };
};
