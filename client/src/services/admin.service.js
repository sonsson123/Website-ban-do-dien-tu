import api from './api';

const adminService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all orders (admin view)
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status, reason) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status, reason });
    return response.data;
  }
};

export default adminService;
