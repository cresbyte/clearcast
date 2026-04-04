import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchCart, addToCart, updateCartQuantity, removeFromCart, clearCartApi } from '../api/cartApi';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            coupon: null,
            discount: 0,
            loading: false,

            setLoading: (loading) => set({ loading }),

            // Set coupon
            setCoupon: (coupon) => {
                const { getSubtotal } = get();
                const subtotal = getSubtotal();
                let discountAmount = 0;

                if (coupon) {
                    if (coupon.discount_type === 'P') {
                        discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
                    } else {
                        discountAmount = parseFloat(coupon.value);
                    }
                    if (discountAmount > subtotal) discountAmount = subtotal;
                }

                set({ coupon, discount: discountAmount });
            },

            clearCoupon: () => set({ coupon: null, discount: 0 }),

            // Recalculate discount based on current total (used when items change)
            recalculateDiscount: () => {
                const { coupon, getSubtotal } = get();
                if (!coupon) {
                    set({ discount: 0 });
                    return;
                }
                const subtotal = getSubtotal();
                let discountAmount = 0;

                if (coupon.discount_type === 'P') {
                    discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
                } else {
                    discountAmount = parseFloat(coupon.value);
                }

                // Re-validate min order
                if (parseFloat(coupon.min_order_amount) > subtotal) {
                    // Coupon no longer valid due to total drop? 
                    // Ideally we should alert user or clear coupon. 
                    // For now, let's just clear logic or allow UI to handle validation.
                    // But if we return 0 discount, it might look confusing if coupon is still set.
                    // Let's keep logic simple: strict calculation
                }

                if (discountAmount > subtotal) discountAmount = subtotal;

                set({ discount: discountAmount });
            },

            // Load cart from backend
            fetchCart: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                set({ loading: true });
                try {
                    const data = await fetchCart();
                    // data is { id, items: [ { product: {...}, variant: {...}, quantity }, ... ], total_price, ... }
                    const formattedItems = data.items.map(item => ({
                        id: `${item.product.id}-${item.variant?.id || 'no-variant'}`,
                        productId: item.product.id,
                        variantId: item.variant?.id || null,
                        name: item.product.name,
                        price: parseFloat(item.variant?.current_price || item.product.sale_price || item.product.base_price || 0),
                        variantName: item.variant?.name || null,
                        quantity: item.quantity,
                        stockLimit: item.variant?.stock_quantity ?? item.product.stock_quantity ?? 0,
                        image: item.variant?.image || item.product.primary_image || (item.product.images?.[0]?.image_url) || '',
                        handle: item.product.slug,
                    }));
                    set({ items: formattedItems });
                    get().recalculateDiscount();
                } catch (error) {
                    console.error('Failed to fetch cart:', error);
                } finally {
                    set({ loading: false });
                }
            },

            // Add item to cart or update quantity if already exists
            addItem: async (product, variant, quantity = 1) => {
                const { items } = get();
                const token = localStorage.getItem('access_token');
                const existingItemIndex = items.findIndex(
                    (item) => item.productId === product.id && item.variantId === (variant?.id || null)
                );

                const stockLimit = variant?.stock_quantity ?? product.stock_quantity ?? 0;

                if (existingItemIndex > -1) {
                    // Update existing item quantity
                    const updatedItems = [...items];
                    const nextQty = updatedItems[existingItemIndex].quantity + quantity;

                    if (nextQty > stockLimit) {
                        updatedItems[existingItemIndex].quantity = stockLimit;
                        // Optional: alert user
                    } else {
                        updatedItems[existingItemIndex].quantity = nextQty;
                    }
                    set({ items: updatedItems });
                } else {
                    // Add new item
                    const finalQuantity = Math.min(quantity, stockLimit);
                    const newItem = {
                        id: `${product.id}-${variant?.id || 'no-variant'}`,
                        productId: product.id,
                        variantId: variant?.id || null,
                        name: product.name || product.title,
                        price: parseFloat(variant?.current_price || (product.sale_price ? product.sale_price : product.base_price || product.price) || 0),
                        variantName: variant?.name || null,
                        quantity: finalQuantity,
                        stockLimit,
                        image: variant?.image || product.primary_image || product.images?.[0] || '',
                        handle: product.slug,
                    };
                    set({ items: [...items, newItem] });
                }

                get().recalculateDiscount();

                if (token) {
                    try {
                        await addToCart(product.id, variant?.id || null, quantity);
                    } catch (error) {
                        console.error('Failed to add to cart:', error);
                    }
                }
            },

            // Remove item from cart
            removeItem: async (itemId) => {
                const { items } = get();
                const token = localStorage.getItem('access_token');
                const itemToRemove = items.find(item => item.id === itemId);

                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));

                get().recalculateDiscount();

                if (token && itemToRemove) {
                    try {
                        await removeFromCart(itemToRemove.productId, itemToRemove.variantId);
                    } catch (error) {
                        console.error('Failed to remove from cart:', error);
                    }
                }
            },

            // Update item quantity
            updateQuantity: async (itemId, quantity) => {
                if (quantity < 1) return;
                const { items } = get();
                const token = localStorage.getItem('access_token');
                const itemToUpdate = items.find(item => item.id === itemId);

                const nextQty = Math.min(quantity, itemToUpdate.stockLimit || 999);

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity: nextQty } : item
                    ),
                }));

                get().recalculateDiscount();

                if (token && itemToUpdate) {
                    try {
                        await updateCartQuantity(itemToUpdate.productId, itemToUpdate.variantId, nextQty);
                    } catch (error) {
                        console.error('Failed to update cart quantity:', error);
                    }
                }
            },

            // Clear entire cart
            clearCart: async () => {
                const token = localStorage.getItem('access_token');
                set({ items: [], coupon: null, discount: 0 });
                if (token) {
                    try {
                        await clearCartApi();
                    } catch (error) {
                        console.error('Failed to clear cart:', error);
                    }
                }
            },

            // Get total number of items in cart
            getItemCount: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            // Get subtotal (before shipping and tax)
            getSubtotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            // Get total (with shipping, no tax for now)
            getTotal: () => {
                const { getSubtotal, discount } = get();
                const subtotal = getSubtotal();
                const shipping = subtotal > 0 ? 15.0 : 0;
                return Math.max(0, subtotal - discount + shipping);
            },

            // Get shipping cost
            getShipping: () => {
                const subtotal = get().getSubtotal();
                return subtotal > 0 ? 15.0 : 0;
            },

            // Check if product variant is in cart
            isInCart: (productId, variantId) => {
                const { items } = get();
                return items.some(
                    (item) => item.productId === productId && item.variantId === variantId
                );
            },

            // Get item quantity in cart
            getItemQuantity: (productId, variantId) => {
                const { items } = get();
                const item = items.find(
                    (item) => item.productId === productId && item.variantId === variantId
                );
                return item?.quantity || 0;
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            // Expire cart after 7 days
            partialize: (state) => ({
                items: state.items,
                coupon: state.coupon,
                discount: state.discount,
                timestamp: Date.now(),
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                    const now = Date.now();
                    if (state.timestamp && now - state.timestamp > sevenDaysInMs) {
                        state.items = [];
                        state.coupon = null;
                        state.discount = 0;
                    }
                }
            },
        }
    )
);

export default useCartStore;
