import api from './api';

const couponService = {
  // Validate coupon code
  validateCoupon: async (code, orderAmount) => {
    const response = await api.post('/coupons/validate', { 
      code, 
      orderAmount 
    });
    return response.data;
  },

  // Get all coupons (admin)
  getCoupons: async (params = {}) => {
    const response = await api.get('/coupons', { params });
    return response.data;
  },

  // Create coupon (admin)
  createCoupon: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },

  // Update coupon (admin)
  updateCoupon: async (id, couponData) => {
    const response = await api.patch(`/coupons/${id}`, couponData);
    return response.data;
  },

  // Delete coupon (admin)
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  }
};

export default couponService;
