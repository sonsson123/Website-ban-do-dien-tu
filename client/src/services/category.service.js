import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get category tree
  getCategoryTree: async () => {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category (admin)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
