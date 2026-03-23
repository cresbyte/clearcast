import api from './axios';

const API_URL = 'reviews/product-reviews/';

export const fetchPendingReviews = async () => {
  const response = await api.get(`${API_URL}pending_reviews/`);
  return response.data;
};

export const fetchProductReviews = async (productId, page = 1) => {
  const response = await api.get(`${API_URL}?product=${productId}&page=${page}`);
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await api.post(`${API_URL}submit_review/`, reviewData);
  return response.data;
};

export const fetchAllReviews = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const fetchReviewDetails = async (id) => {
  const response = await api.get(`${API_URL}${id}/`);
  return response.data;
};

export const updateReviewStatus = async (id, statusData) => {
  const response = await api.patch(`${API_URL}${id}/`, statusData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`${API_URL}${id}/`);
  return response.data;
};

export const fetchAdminDashboardStats = async () => {
  const response = await api.get('reviews/dashboard/');
  return response.data;
};
