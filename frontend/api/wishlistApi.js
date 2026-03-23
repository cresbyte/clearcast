import api from './axios';

export const fetchWishlist = async () => {
    const response = await api.get('wishlists/');
    return response.data;
};

export const addToWishlist = async (productId) => {
    const response = await api.post('wishlists/add/', {
        product_id: productId
    });
    return response.data;
};

export const removeFromWishlist = async (productId) => {
    const response = await api.post('wishlists/remove/', {
        product_id: productId
    });
    return response.data;
};
