import axios from './axios';

export const fetchDiscounts = async () => {
    const response = await axios.get('/orders/discounts/');
    return response.data;
};

export const fetchDiscount = async (id) => {
    const response = await axios.get(`/orders/discounts/${id}/`);
    return response.data;
};

export const createDiscount = async (data) => {
    const response = await axios.post('/orders/discounts/', data);
    return response.data;
};

export const updateDiscount = async (id, data) => {
    const response = await axios.put(`/orders/discounts/${id}/`, data);
    return response.data;
};

export const deleteDiscount = async (id) => {
    const response = await axios.delete(`/orders/discounts/${id}/`);
    return response.data;
};

export const validateDiscount = async (code, amount) => {
    const response = await axios.post('/orders/discounts/validate/', { code, amount });
    return response.data;
};
