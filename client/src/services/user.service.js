import api from './api';

const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },

  // Get user addresses
  getAddresses: async () => {
    const response = await api.get('/users/me/addresses');
    return response.data;
  },

  // Add address
  addAddress: async (addressData) => {
    const response = await api.post('/users/me/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.patch(`/users/me/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/me/addresses/${addressId}`);
    return response.data;
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Admin: Update user
  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
