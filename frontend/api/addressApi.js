import api from './axios';

// Fetch all addresses for the authenticated user (or for a specific user if staff/admin)
export const fetchAddresses = async (userId = null) => {
    const url = userId ? `addresses/?user_id=${userId}` : 'addresses/';
    const response = await api.get(url);
    return response.data;
};

// Create a new address
export const createAddress = async (addressData) => {
    const response = await api.post('addresses/', addressData);
    return response.data;
};

// Update an existing address
export const updateAddress = async (id, addressData) => {
    const response = await api.put(`addresses/${id}/`, addressData);
    return response.data;
};

// Delete an address
export const deleteAddress = async (id) => {
    const response = await api.delete(`addresses/${id}/`);
    return response.data;
};

// Get a single address by ID
export const fetchAddressById = async (id) => {
    const response = await api.get(`addresses/${id}/`);
    return response.data;
};
