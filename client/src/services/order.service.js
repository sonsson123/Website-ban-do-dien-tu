import api from './api';

const orderService = {
  // Create new order from cart
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Admin: Get all orders
  getAdminOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, status, reason) => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status, reason });
    return response.data;
  }
};

export default orderService;
