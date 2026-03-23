import api from './axios';

export const fetchCart = async () => {
    const response = await api.get('orders/cart/');
    return response.data;
};

export const addToCart = async (productId, variantId, quantity) => {
    const response = await api.post('orders/cart/add/', {
        product_id: productId,
        variant_id: variantId,
        quantity: quantity
    });
    return response.data;
};

export const updateCartQuantity = async (productId, variantId, quantity) => {
    const response = await api.post('orders/cart/update-quantity/', {
        product_id: productId,
        variant_id: variantId,
        quantity: quantity
    });
    return response.data;
};

export const removeFromCart = async (productId, variantId) => {
    const response = await api.post('orders/cart/remove/', {
        product_id: productId,
        variant_id: variantId
    });
    return response.data;
};

export const clearCartApi = async () => {
    const response = await api.post('orders/cart/clear/');
    return response.data;
};
