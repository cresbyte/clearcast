import api from './axios';

/**
 * Create a new order with payment processing
 * @param {Object} orderData - Order data including address_id, payment_method, items, and payment details
 */
export const createOrder = async (orderData) => {
    const response = await api.post('orders/', orderData);
    return response.data;
};

/**
 * Fetch all orders for the authenticated user
 */
export const fetchOrders = async () => {
    const response = await api.get('orders/');
    return response.data;
};

/**
 * Fetch a single order by ID
 * @param {number} id - Order ID
 */
export const fetchOrderById = async (id) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
};

/**
 * Update order status (Staff only)
 * @param {number} id - Order ID
 * @param {string} status - New status code (P, A, S, D, C)
 */
export const updateOrderStatus = async (id, status) => {
    const response = await api.post(`orders/${id}/update-status/`, { status });
    return response.data;
};

/**
 * Fetch active payment gateways
 */
export const fetchActiveGateways = async () => {
    const response = await api.get('orders/gateways/');
    return response.data;
};

/**
 * Fetch all payment gateways (Admin)
 */
export const fetchAllGateways = async () => {
    const response = await api.get('orders/gateways/');
    return response.data;
};

/**
 * Create a new payment gateway
 */
export const createPaymentGateway = async (data) => {
    const response = await api.post('orders/gateways/', data);
    return response.data;
};

/**
 * Update a payment gateway
 */
export const updatePaymentGateway = async (id, data) => {
    const response = await api.patch(`orders/gateways/${id}/`, data);
    return response.data;
};

/**
 * Delete a payment gateway
 */
export const deletePaymentGateway = async (id) => {
    const response = await api.delete(`orders/gateways/${id}/`);
    return response.data;
};

/**
 * Verify Paystack payment transaction
 */
export const verifyPaystackPayment = async (reference) => {
    const response = await api.get('orders/gateways/paystack-verify/', { params: { reference } });
    return response.data;
};
