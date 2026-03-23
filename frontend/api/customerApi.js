import axios from "./axios";

export const getCustomers = async () => {
  const response = await axios.get("admin/customers/");
  return response.data.results;
};

export const getCustomerDetails = async (id) => {
  const response = await axios.get(`admin/customers/${id}/`);
  return response.data;
};

export const getCustomerOrders = async (userId) => {
  // We already have /api/orders/ which supports staff filtering or we can use it to get all orders
  // Actually, OrderViewSet filters by user if not staff. If staff, it gets all.
  // We might need an endpoint to get orders for a SPECIFIC user.
  // Looking at OrderViewSet.get_queryset:
  // if self.request.user.is_staff: return Order.objects.all()

  // We should probably add a filter for customer_id in OrderViewSet or use a separate endpoint.
  // For now, let's assume we can filter /api/orders/ by user_id if we enhance the backend.

  const response = await axios.get(`orders/?user_id=${userId}`);
  return response.data;
};
