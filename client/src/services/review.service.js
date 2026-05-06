import api from './api';

const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Create a review for a product
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Check if user can review a product (purchased and not yet reviewed)
  canReview: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/can-review`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, allow review by default for demo
      return { canReview: true };
    }
  }
};

export default reviewService;
