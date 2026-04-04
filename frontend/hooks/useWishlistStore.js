import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../api/wishlistApi';

const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],
            loading: false,

            setLoading: (loading) => set({ loading }),

            // Load wishlist from backend
            fetchWishlist: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                set({ loading: true });
                try {
                    const data = await fetchWishlist();
                    // data is { id, items: [ { product: {...}, added_at }, ... ], created_at }
                    const formattedItems = data.items.map(item => ({
                        id: item.product.id,
                        title: item.product.name,
                        price: parseFloat(item.product.sale_price || item.product.base_price || 0),
                        compareAtPrice: item.product.sale_price ? parseFloat(item.product.base_price || 0) : null,
                        image: item.product.primary_image || (item.product.images?.[0]?.image_url) || '',
                        handle: item.product.slug,
                        category: item.product.category?.name || 'Uncategorized',
                        addedAt: new Date(item.added_at).getTime(),
                        rawProduct: item.product,
                    }));
                    set({ items: formattedItems });
                } catch (error) {
                    console.error('Failed to fetch wishlist:', error);
                } finally {
                    set({ loading: false });
                }
            },

            // Toggle product in wishlist
            toggleItem: async (product) => {
                const { items } = get();
                const token = localStorage.getItem('access_token');
                const existingIndex = items.findIndex((item) => item.id === product.id);

                if (existingIndex > -1) {
                    // Remove from wishlist
                    set({
                        items: items.filter((item) => item.id !== product.id),
                    });
                    if (token) {
                        try {
                            await removeFromWishlist(product.id);
                        } catch (error) {
                            console.error('Failed to remove from wishlist:', error);
                        }
                    }
                } else {
                    // Add to wishlist
                    const wishlistItem = {
                        id: product.id,
                        title: product.name || product.title,
                        price: product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price || product.base_price || 0),
                        compareAtPrice: product.sale_price ? parseFloat(product.price || product.base_price || 0) : null,
                        image: product.primary_image || product.images?.[0] || product.variants?.[0]?.image || '',
                        handle: product.slug,
                        category: product.categoryName || product.category?.name || 'Uncategorized',
                        subcategory: product.subcategory || '',
                        addedAt: Date.now(),
                        rawProduct: product,
                    };
                    set({ items: [...items, wishlistItem] });
                    if (token) {
                        try {
                            await addToWishlist(product.id);
                        } catch (error) {
                            console.error('Failed to add to wishlist:', error);
                        }
                    }
                }
            },

            // Remove item from wishlist
            removeItem: async (productId) => {
                const token = localStorage.getItem('access_token');
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
                if (token) {
                    try {
                        await removeFromWishlist(productId);
                    } catch (error) {
                        console.error('Failed to remove from wishlist:', error);
                    }
                }
            },

            // Check if product is in wishlist
            isInWishlist: (productId) => {
                const { items } = get();
                return items.some((item) => item.id === productId);
            },

            // Clear entire wishlist
            clearWishlist: () => {
                set({ items: [] });
            },

            // Get wishlist count
            getCount: () => {
                const { items } = get();
                return items.length;
            },

            // Get items sorted by date added
            getItemsSorted: () => {
                const { items } = get();
                return [...items].sort((a, b) => b.addedAt - a.addedAt);
            },
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useWishlistStore;
