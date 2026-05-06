import api from './api';

const uploadService = {
  uploadCategoryImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/uploads/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};

export default uploadService;
